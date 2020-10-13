const _TOWN_CODES = ["A", "D", "G", "J", "M", "P", "S", "V", "Y", "AB", "AE", "AH", "AK", "AN", "AQ", "AT", "AW"];
const _BUY_CODES  = ["B", "E", "H", "K", "N", "Q", "T", "W", "Z", "AC", "AF", "AI", "AL", "AO", "AR", "AU", "AX"];
const _SELL_CODES = ["C", "F", "I", "L", "O", "R", "U", "X", "AA", "AD", "AG", "AJ", "AM", "AP", "AS", "AV", "AY"];

var _towns;
var _origPrices;
var _bestPrices;
var _bestPriceTable = null;
var _townTable = null;
var _sortDirection = -1;
var _sortedType = 0;
var _itemHeaderElement;

function sort(type) {
    if (type != "Item")
        return;

    _itemHeaderElement.setAttribute("data-sort-direction", _sortedType%3);

    if ((++_sortedType)%3==0) {
        _bestPrices = _origPrices.slice(0);
    }
    else {
        _bestPrices = _bestPrices.sort(function(x, y) {
            var a = [x.name, y.name].sort();
            if (y.name == a[0]) return -_sortDirection;
            if (x.name == a[0]) return _sortDirection;
            return 0;
        });

        _sortDirection = -_sortDirection;
    }

    makeTable();
}

function makeTownTable(key) {
    var towns = document.getElementById("maindiv");

    if (_townTable != null)
        towns.removeChild(_townTable);

    _townTable = document.createElement("table");
    _townTable.className = "towns";
    _townTable.border = "1";

    var caption = document.createElement("caption");
    caption.innerHTML = key;
    _townTable.appendChild(caption);

    var row = _townTable.insertRow(-1);

    var headerCell = document.createElement("TH");
    headerCell.innerHTML = "Town";
    row.appendChild(headerCell);

    headerCell = document.createElement("TH");
    headerCell.innerHTML = "Buy";
    row.appendChild(headerCell);

    headerCell = document.createElement("TH");
    headerCell.innerHTML = "Sell";
    row.appendChild(headerCell);

    for (const key2 in _allItems[key]) {
        console.log(`${key2}: ${JSON.stringify(_allItems[key][key2])}`);

        var town = _allItems[key][key2];
        if (isNaN(town.Buy) && isNaN(town.Sell))
            continue;

        var row = _townTable.insertRow(-1);
        var cell = row.insertCell(-1);
        cell.innerHTML = key2;

        cell = row.insertCell(-1);
        cell.innerHTML = town.Buy;

        cell = row.insertCell(-1);
        cell.innerHTML = town.Sell;
    }

    towns.appendChild(_townTable);
}

function makeTable() {
    var bestPrices = document.getElementById("maindiv");

    if (_bestPriceTable != null)
        bestPrices.removeChild(_bestPriceTable);

    _bestPriceTable = document.createElement("table");
    _bestPriceTable.className = "bestPrices";
    _bestPriceTable.border = "1";

    var caption = document.createElement("caption");
    caption.innerHTML = "Best Prices";
    _bestPriceTable.appendChild(caption);

    var row = _bestPriceTable.insertRow(-1);

    _itemHeaderElement = document.createElement("TH");
    _itemHeaderElement.setAttribute("data-sort-direction", _sortedType%3);
    _itemHeaderElement.innerHTML = "Item";
    _itemHeaderElement.addEventListener("click", function() {
        sort("Item");
    }, false);
    row.appendChild(_itemHeaderElement);

    var headerCell = document.createElement("TH");
    headerCell.innerHTML = "Buy";
    row.appendChild(headerCell);

    headerCell = document.createElement("TH");
    headerCell.innerHTML = "Sell";
    row.appendChild(headerCell);

    for (var i = 0; i < _bestPrices.length; i++) {
        var row = _bestPriceTable.insertRow(-1);

        var cell = row.insertCell(-1);
        const name = _bestPrices[i].name;
        cell.innerHTML = name;
        cell.addEventListener("click", function() {
            makeTownTable(name);
        }, false);

        cell = row.insertCell(-1);
        if (_bestPrices[i].min != Number.MAX_SAFE_INTEGER)
            cell.innerHTML = _bestPrices[i].townMin + " for " + _bestPrices[i].min;
        else
            cell.innerHTML = "N/A";

        cell = row.insertCell(-1);
        if (_bestPrices[i].max != -1)
            cell.innerHTML = _bestPrices[i].townMax + " for " + _bestPrices[i].max;
        else
            cell.innerHTML = "N/A";
    }

    bestPrices.appendChild(_bestPriceTable);
}


function ProcessExcel(data) {
    var workbook = XLSX.read(data, { type: 'binary' });
    var firstSheet = workbook.SheetNames[0];
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

    _bestPrices = [];
    _allItems = {};
    _towns = excelRows[0];

    // 0 is _towns, 1 is Buy/Sell, 2 is the juice
    for (var i = 2; i < excelRows.length; i++) {
        const currentRow = excelRows[i];
        const name = currentRow["A"];

        if (name == undefined) continue

        var t = {
            name,
            townMax: "",
            townMin: "",
            max:     -1,
            min:     Number.MAX_SAFE_INTEGER
        }

        var item = {};

        for (var v = 0; v < _TOWN_CODES.length; v++) {
            const s = parseInt(currentRow[_SELL_CODES[v]]);
            const b = parseInt(currentRow[_BUY_CODES[v]]);
            const town = _towns[_TOWN_CODES[v]];

            if (s > t.max)
            {
                t.townMax = town;
                t.max = s;
            }

            if (b < t.min)
            {
                t.townMin = town;
                t.min = b;
            }

            item[town] = {"Buy" : b, "Sell" : s};
        }

        _allItems[name] = item;
        _bestPrices.push(t);
    }

    _origPrices = _bestPrices.slice(0);

    makeTable();
};

function readFile() {
    if (typeof (FileReader) != "undefined") {
        var reader = new FileReader();

        if (reader.readAsBinaryString) {
            reader.onload = function (e) {
                ProcessExcel(e.target.result);
            };

            fetch('https://docs.google.com/spreadsheets/d/15rDnKn4ijusnj1p9AXFB2kOPbUEPvdSkhYb4VtTrLYs/edit?usp=sharing')
                .then(response => response.blob())
                .then(data => reader.readAsBinaryString(data))
                .catch(err => console.log(err));
        }
    }
}

function main () {
    readFile();

    return 0;
}

main();
