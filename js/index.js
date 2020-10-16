const _TOWN_CODES = ["A", "D", "G", "J", "M", "P", "S", "V", "Y", "AB", "AE", "AH", "AK", "AN", "AQ", "AT", "AW", "AZ", "BC", "BF", "BI", "BL", "BO", "BR", "BU", "BX", "CA", "CD", "CG", "CJ", "CM", "CP"];
const _BUY_CODES  = ["B", "E", "H", "K", "N", "Q", "T", "W", "Z", "AC", "AF", "AI", "AL", "AO", "AR", "AU", "AX", "BA", "BD", "BG", "BJ", "BM", "BP", "BS", "BV", "BY", "CB", "CE", "CH", "CK", "CN", "CQ"];
const _SELL_CODES = ["C", "F", "I", "L", "O", "R", "U", "X", "AA", "AD", "AG", "AJ", "AM", "AP", "AS", "AV", "AY", "BB", "BE", "BH", "BK", "BN", "BQ", "BT", "BW", "BZ", "CC", "CF", "CI", "CL", "CO", "CR"];

var _towns;

var _headers = {};

var _origPrices;
var _bestPrices;
var _bestPriceTable = null;

var _allItems;
var _origItems = {};
var _itemTable = null;

var _allTowns;
var _origTowns = {};
var _townTable = null;

function sort(key, sortFunction) {
    console.log(_headers[key]);

    var sortType = _headers[key].getAttribute('data-sort-type');
    if (sortType == undefined) sortType = 0;
    sortType = ++sortType % 3;

    if (sortType == 0) {
        sortFunction(null);
    }
    else {
        var sortDir = _headers[key].getAttribute('data-sort-direction');
        if (sortDir == undefined) sortDir = -1;

        sortFunction(sortDir);
        sortDir = -sortDir;
        _headers[key].setAttribute("data-sort-direction", sortDir);
    }

    _headers[key].setAttribute('data-sort-type', sortType);
}

function makeTownTable(key) {
    var maindiv = document.getElementById("maindiv");

    if (_townTable != null)
        maindiv.removeChild(_townTable);

    _townTable = document.createElement("table");
    _townTable.className = "towns";
    _townTable.border = "1";

    var caption = document.createElement("caption");
    caption.innerHTML = key;
    _townTable.appendChild(caption);

    var row = _townTable.insertRow(-1);

    const headerKey = "town";
    _headers[headerKey] = document.createElement("TH");
    _headers[headerKey].className = "PointerAble";
    _headers[headerKey].innerHTML = "Item";
    _headers[headerKey].addEventListener("click", function() {
        sort(headerKey, (dir) => {
            if (dir == null) {
                _allTowns[key] = _origTowns[key].slice(0);
            }
            else {
                if (_origTowns[key] == undefined) {
                    _origTowns[key] = _allTowns[key].slice(0);
                }

                _allTowns[key] = _allTowns[key].sort(function(x, y) {
                    var a = [x.Item, y.Item].sort();
                    if (y.Item == a[0]) return -dir;
                    if (x.Item == a[0]) return dir;
                    return 0;
                });
            }
            makeTownTable(key);
        })
    }, false);
    row.appendChild(_headers[headerKey]);

    headerCell = document.createElement("TH");
    headerCell.innerHTML = "Buy";
    row.appendChild(headerCell);

    headerCell = document.createElement("TH");
    headerCell.innerHTML = "Sell";
    row.appendChild(headerCell);

    for (var i=0; i<_allTowns[key].length; i++) {
        const item = _allTowns[key][i];

        var row = _townTable.insertRow(-1);
        var cell = row.insertCell(-1);
        cell.innerHTML = item.Item;;
        cell.className = "PointerAble";
        cell.addEventListener("click", function() {
            makeItemTable(item.Item);
        }, false);

        cell = row.insertCell(-1);
        cell.innerHTML = item.Buy;

        cell = row.insertCell(-1);
        cell.innerHTML = item.Sell;
    }

    maindiv.appendChild(_townTable);
}

function makeItemTable(item) {
    var maindiv = document.getElementById("maindiv");

    if (_itemTable != null)
        maindiv.removeChild(_itemTable);

    _itemTable = document.createElement("table");
    _itemTable.className = "items";
    _itemTable.border = "1";

    var caption = document.createElement("caption");
    caption.innerHTML = item;
    _itemTable.appendChild(caption);

    var row = _itemTable.insertRow(-1);

    const headerKey = "item";
    _headers[headerKey] = document.createElement("TH");
    _headers[headerKey].className = "PointerAble";
    _headers[headerKey].innerHTML = "Town";
    _headers[headerKey].addEventListener("click", function() {
        sort(headerKey, (dir) => {
            if (dir == null) {
                _allItems[item] = _origItems[item];
                console.log(_allItems[item]);
            }
            else {
                if (_origItems[item] == undefined) {
                    _origItems[item] = {};
                    for (const key2 in _allItems[item]) {
                        _origItems[item][key2] = _allItems[item][key2]
                    }
                }

                if ( dir == -1 )
                    _allItems[item] = (Object.keys(_allItems[item]).sort().reduce(function (result, key) {
                        result[key] = _allItems[item][key];
                        return result;
                    }, {}));
                else
                    _allItems[item] = (Object.keys(_allItems[item]).sort().reverse().reduce(function (result, key) {
                        result[key] = _allItems[item][key];
                        return result;
                    }, {}));


                console.log(_allItems[item]);
            }

            makeItemTable(item);
        })
    }, false);
    row.appendChild(_headers[headerKey]);

    headerCell = document.createElement("TH");
    headerCell.innerHTML = "Buy";
    row.appendChild(headerCell);

    headerCell = document.createElement("TH");
    headerCell.innerHTML = "Sell";
    row.appendChild(headerCell);

    for (const key2 in _allItems[item]) {
        var town = _allItems[item][key2];
        if (isNaN(town.Buy) && isNaN(town.Sell))
            continue;

        var row = _itemTable.insertRow(-1);
        var cell = row.insertCell(-1);
        cell.innerHTML = key2;
        cell.className = "PointerAble";
        cell.addEventListener("click", function() {
            makeTownTable(key2);
        }, false);

        cell = row.insertCell(-1);
        cell.innerHTML = town.Buy;

        cell = row.insertCell(-1);
        cell.innerHTML = town.Sell;
    }

    if (_townTable!=null)
        maindiv.insertBefore(_itemTable, _townTable);
    else
        maindiv.appendChild(_itemTable);
}

function makeTable() {
    var maindiv = document.getElementById("maindiv");

    if (_bestPriceTable != null)
        maindiv.removeChild(_bestPriceTable);

    _bestPriceTable = document.createElement("table");
    _bestPriceTable.className = "bestPrices";
    _bestPriceTable.border = "1";

    var caption = document.createElement("caption");
    caption.innerHTML = "Best Prices";
    _bestPriceTable.appendChild(caption);

    var row = _bestPriceTable.insertRow(-1);

    const headerKey = "best";
    _headers[headerKey] = document.createElement("TH");
    _headers[headerKey].className = "PointerAble";
    _headers[headerKey].innerHTML = "Item";
    _headers[headerKey].addEventListener("click", function() {
        sort(headerKey, (dir) => {
            if ( dir == null )
                _bestPrices = _origPrices.slice(0);
            else
                _bestPrices = _bestPrices.sort(function(x, y) {
                    var a = [x.name, y.name].sort();
                    if (y.name == a[0]) return -dir;
                    if (x.name == a[0]) return dir;
                    return 0;
                });

            makeTable();
        })
    }, false);
    row.appendChild(_headers[headerKey]);

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
        cell.className = "PointerAble";
        cell.addEventListener("click", function() {
            makeItemTable(name);
        }, false);

        cell = row.insertCell(-1);
        if (_bestPrices[i].min != Number.MAX_SAFE_INTEGER)
        {
            cell.innerHTML = _bestPrices[i].townMin + " for " + _bestPrices[i].min;
            cell.className = "PointerAble";
            const townName = _bestPrices[i].townMin;
            cell.addEventListener("click", function() {
                makeTownTable(townName);
            }, false);

        }
        else
            cell.innerHTML = "N/A";

        cell = row.insertCell(-1);
        if (_bestPrices[i].max != -1)
        {
            cell.innerHTML = _bestPrices[i].townMax + " for " + _bestPrices[i].max;
            cell.className = "PointerAble";
            const townName = _bestPrices[i].townMax;
            cell.addEventListener("click", function() {
                makeTownTable(townName);
            }, false);
        }
        else
            cell.innerHTML = "N/A";
    }

    if (_itemTable!=null)
        maindiv.insertBefore(_bestPriceTable, _itemTable);
    else if (_townTable!=null)
        maindiv.insertBefore(_bestPriceTable, _townTable);
    else
        maindiv.appendChild(_bestPriceTable);
}


function ProcessExcel(data) {
    var workbook = XLSX.read(data, { type: 'binary' });
    var firstSheet = workbook.SheetNames[0];
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

    _bestPrices = [];
    _allItems = {};
    _allTowns = {};
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

            if (!(isNaN(s) && isNaN(b)))
            {
                if (_allTowns[town] == undefined)
                    _allTowns[town] = [];

                _allTowns[town].push({"Item": name, "Buy" : b, "Sell" : s});
            }

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
