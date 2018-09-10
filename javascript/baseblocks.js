var dataTableWidth = 400;
var dataTableHeight = 210;

Morph.prototype.contextMenu = function () {
    nop()
};
WorldMorph.prototype.contextMenu = function () {
    nop()
};

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}
//if (typeof Object.keys !== "function") {
//    (function() {
//        Object.keys = Object_keys;
//        function Object_keys(obj) {
//            var keys = [], name;
//            for (name in obj) {
//                if (obj.hasOwnProperty(name)) {
//                    keys.push(name);
//                }
//            }
//            return keys;
//        }
//    })();
//}
var click = document.createElement('audio');
click.src = 'media/click.wav';
var clickSound = function () {
    click.play();
};
function drawCircle(context, x, y, radius, color) {
    var current_color = context.fillStyle;
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.fillStyle = current_color;
}
function drawStem(context, x1, y1, x2, y2, width, color) {
    var current_color = context.fillStyle;
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x1 - (width / 2), y1);
    context.lineTo(x1 + (width / 2), y1);
    context.lineTo(x2 + (width / 2), y2);
    context.lineTo(x2 - (width / 2), y2);
    context.closePath();
    context.fill();
    context.fillStyle = current_color;
}
function drawTopArc(context, x, y, radius, width, color) {
    // x, y is the connection point. in other words the bottom maximum of the arc
    var current_color = context.fillStyle;
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y + width + radius, radius, 0, Math.PI, true);
    context.moveTo(x - radius, y + width + radius);
    context.lineTo(x - radius - width, y + width + radius);
    context.arc(x, y + width + radius, radius + width, Math.PI, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.fillStyle = current_color;
}
function drawOpRectangle(context, x, y, gap_width, conn_height, rec_width, rec_height, color) {
//    // draw rectangle
    var current_color = context.fillStyle;
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x, y); // bottom of circle
    context.lineTo(x + gap_width + rec_width, y); // bottom right of rectangle
    context.lineTo(x + gap_width + rec_width, y - rec_height); // top right of rectangle
    context.lineTo(2 * x + gap_width, y - rec_height); // top left of rectangle
    context.lineTo(2 * x + gap_width, y - conn_height); // top right of connector of circle and rectangle connector
    context.lineTo(x, y - conn_height); // finish the connector inside the circle
    context.closePath();
    context.fill();
    context.fillStyle = current_color;
}
function drawEqTriangle(context, x1, y1, x2, y2, color) {
    // should be changed to angle and scale
    var current_color = context.fillStyle,
        height = (new Point(x2, y2)).distanceTo(new Point(x1, y1)),
        half_side = Math.floor((2 * height / Math.sqrt(3)) / 2);
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x2, y2 + half_side); // bottom left point
    context.lineTo(x2, y2 - half_side); // top left  point
    context.lineTo(x1, y1); // middle right point
    context.closePath();
    context.fill();
    context.fillStyle = current_color;
}
var query_operators = {};

function parseSelect0(string) {

    var operation = string.split(' ');
    switch (operation[1]) {
        case '<':
            operation[1] = '$lt';
            break;
        case '<=':
            operation[1] = '$lte';
            break;
        case '=':
            operation[1] = '$eq';
            break;
        case '<>':
            operation[1] = '$ne';
            break;
        case '>=':
            operation[1] = '$gte';
            break;
        case '>':
            operation[1] = '$gt';
            break;
        default:
            operation[1] = '$eq'
    }
    var comparisons = {}, selector = {};
    selector[operation[1]] = operation[2];
    comparisons[operation[0]] = selector;
    return comparisons;
}
function compare(a, op, b) {
    switch (op) {
        case '<':
            return a < b;
        case '<=':
            return a <= b;
        case '=':
            return a == b;
        case '<>':
            return a != b;
        case '>=':
            return a >= b;
        case '>':
            return a > b;
        default :
            break;
    }
}
var validate = function (query, entry) {
    var action = query[0];
    if (action == 'CONDITION') {
        return compare(validate(query[1], entry), query[2], validate(query[3], entry));
    }
    else if (action == 'ATTRIBUTE') {
        return entry[query[1].toUpperCase()];
    }
    else if (action == 'STRING') {
        return query[1];
    }
    else if (action == 'NUMBER') {
        return query[1];
    }
    else if (action == 'AND') {
        return validate(query[1], entry) && validate(query[2], entry);
    }
    else if (action == 'OR') {
        return validate(query[1], entry) || validate(query[2], entry);
    }
};
function dedup(data, attributes) {
    var temp = [];
    data = data.sort(function (a, b) {
        return full_cmp(a, b, attributes);
    });
    var last = data[0];
    temp.push(data[0]);
    for (var i = 0; i < data.length; i++) {
        if (full_cmp(last, data[i], attributes) != 0) {
            temp.push(data[i]);
            last = data[i];
        }
    }
    return temp;
}
query_operators['Select'] = function () {
    var result = this.getChildBlocks()[0];
    if (result) {
        var full = result.get_query();
        result = full;
        if (result != null) {
            result = result['data'];
            var text = this.getInputText();
            try {
                var comparisons = parser.parse(text);
            } catch (err) {
                console.log('could not parse input');
                return null;
            }
            var data = [];
            for (var i = 0; i < result.length; i++) {
                if (validate(comparisons, result[i])) {
                    data.push(result[i]);
                }
            }
            if (data.length > 0) {
                data = dedup(data, full['attributes']);
                return {
                    "table_name": "table_result",
                    "data": data,
                    'name': full['name'],
                    'attributes': full['attributes']
                };
            }
        }
        else {
            return null;
        }
    }
    return null;
};
query_operators['Project'] = function () {
    var result = this.getChildBlocks()[0];
    if (result) {
        var full = result.get_query();
        result = full;
        if (result != null) {
            try {
                var operation = parserProject.parse(this.getInputText());
            } catch (e) {
                return null;
            }
            var input = operation;
            for (var i = 0; i < operation.length; i++) {
                operation[i] = operation[i].toUpperCase();
            }
            result = result['data'];
            var data = [], temp = [];
            operation = operation.filter(function (op) {
                return result[0].hasOwnProperty(op)
            });
            if (operation.length != 0) {
                result.forEach(function (entry) {
                    var new_entry = {};
                    operation.forEach(function (col_name) {
                        if (entry.hasOwnProperty(col_name)) {
                            new_entry[col_name] = entry[col_name];
                        }
                    });
                    temp.push(new_entry);
                });
                data = dedup(temp, input);

//                temp = temp.sort(function(a, b){return full_cmp(a, b, input);});
//                var last = temp[0];
//                data.push(temp[0]);
//                for (i=0; i < temp.length; i++){
//                    if (full_cmp(last, temp[i], input) != 0){
//                        data.push(temp[i]);
//                        last = temp[i];
//                    }
//                }
                return {"table_name": "table_result", "data": data, 'name': full['name'], 'attributes': input};
            }
        }
    }
    return null;
};

function cmp(a, b) {

    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
}
function full_cmp(a, b, attributes) {
    // TODO bug if a or b doesn't have an attribute
    var diff;
    for (var i = 0; i < attributes.length; i++) {
        diff = cmp(a[attributes[i]], b[attributes[i]]);
        if (diff) {
            return diff
        }
    }
    return 0;
}
function full_cmp_grouping(a, b, attributes) {
    var diff;
    for (var i = 0; i < attributes.length; i++) {
        if (a.hasOwnProperty(attributes[i]) && b.hasOwnProperty(attributes[i])) {
            diff = cmp(a[attributes[i]], b[attributes[i]]);
            if (diff) {
                return diff
            }
        } else {
            return 1
        }
    }
    return 0;
}
query_operators['GroupBy'] = function () {
    var result = this.getChildBlocks()[0];
    if (result) {
        result = result.get_query();
        if (result != null) {
            var cols = result['attributes'];
            result = result['data'];
            // Retrieves the user input
            var inputs = this.children.filter(function (child) {
                return child instanceof InputMorph
            });
            var temp1 = detect(inputs[0].children, function (child) {
                return child instanceof StringMorph
            });
            var temp2 = detect(inputs[1].children, function (child) {
                return child instanceof StringMorph
            });
            var operation = {'group': temp1.text, 'aggregation': temp2.text};
            // Parses the Group By field
            try {
                var groupby = parserProject.parse(operation['group']);
            } catch (e) {
                return null;
            }
            if (groupby.length == 1 && groupby[0] == '') {
                return null;
            }
            for (var idx = 0; idx < groupby.length; idx++) {
                groupby[idx] = groupby[idx].toUpperCase();
            }
            var i;
            var aggr_ops = ['SUM', 'COUNT', 'AVG', 'MAX', 'MIN', 'DISTINCT-COUNT'];
            var out = groupby.slice(0);
            var attr, aggr, rename, temp3, renames = [], t5, outtemp;
            var aggregation_keys = [];
            var re = /([0-9a-zA-Z\-]+)\(([0-9a-zA-Z\*]+)\)[ ]*[as|AS]*[ ]*([0-9a-zA-Z]*)/;
            var taggr = operation['aggregation'].split(',');
            var new_aggregation = [];
            outtemp = groupby.slice(0);
            for (i = 0; i < taggr.length; i++) {
                temp3 = re.exec(taggr[i]);
                if (temp3) {
                    aggr = temp3[1].toUpperCase();
                    if (aggr_ops.indexOf(aggr) == -1) return null;
                    attr = temp3[2].toUpperCase();
                    if (attr != '*' && cols.indexOf(attr) == -1) return null;
                    rename = temp3[3].toUpperCase();
                    t5 = aggr + '(' + attr + ')';
                    if (rename) {
                        renames.push([t5, rename]);
                        outtemp.push(rename);
                    }
                    else {
                        outtemp.push(t5);
                    }
                    aggregation_keys.push(t5);
                    out.push(t5);
                    new_aggregation.push([aggr, attr, rename]);
                }
                else {
                    return null;
                }
            }
            var query_result = [];
            result.sort(function (a, b) {
                return full_cmp(a, b, groupby);
            });
            var current_group_result = {};
            var op, op_val, val, t, k;
            // Groups and aggregates the data
            for (i = 0; i < result.length; i++) {
                // detect changes in groupings
                for (var g = 0; g < groupby.length; g++) {
                    // if an entry does not have a key adds it
                    if (!current_group_result.hasOwnProperty(groupby[g])) {
                        current_group_result[groupby[g]] = result[i][groupby[g]];
                    }
                    if ((current_group_result[groupby[g]] != result[i][groupby[g]])) {
                        var temp = {};
                        // filter the keys in each entry
                        for (k = 0; k < groupby.length; k++) {
                            temp[groupby[k]] = current_group_result[groupby[k]];
                        }
                        for (k = 0; k < new_aggregation.length; k++) {
                            var t10 = new_aggregation[k][0] + '(' + new_aggregation[k][1] + ')';
                            var res10 = current_group_result[t10];
                            if (new_aggregation[k][2]) {
                                t10 = new_aggregation[k][2];
                            }
                            temp[t10] = res10;
                        }
                        query_result.push(temp);
                        current_group_result = {};
                        for (var ii = 0; ii < groupby.length; ii++) {
                            current_group_result[groupby[ii]] = result[i][groupby[ii]];
                        }
                    }
                }

                for (var ak = 0; ak < aggregation_keys.length; ak++) {
                    op_val = aggregation_keys[ak].split('(');
                    op = op_val[0];
                    val = op_val[1].split(')')[0];
                    if (!current_group_result.hasOwnProperty(aggregation_keys[ak])) {
                        var initial = null;
                        if (op == 'sum' || op == 'count' || op == 'distinct-count') {
                            initial = 0;
                        }
                        current_group_result[aggregation_keys[ak]] = initial;
                    }
                    switch (op) {
                        case 'SUM':
                            current_group_result[aggregation_keys[ak]] += result[i][val];
                            break;
                        case 'DISTINCT-COUNT':
                            if (result[i][val]) {
                                if (current_group_result[aggregation_keys[ak]]) {
                                    if (current_group_result[aggregation_keys[ak] + "__distinct__"].indexOf(result[i][val]) == -1) {
                                        current_group_result[aggregation_keys[ak]]++;
                                        current_group_result[aggregation_keys[ak] + "__distinct__"].push(result[i][val]);

                                    }
                                }
                                else {
                                    current_group_result[aggregation_keys[ak]]++;
                                    current_group_result[aggregation_keys[ak] + "__distinct__"] = [result[i][val]];
                                }
                            }
                            break;
                        case 'COUNT':
                            if (val == '*') {
                                current_group_result[aggregation_keys[ak]]++;
                            }
                            else if (result[i][val]) {
                                current_group_result[aggregation_keys[ak]]++;

                            }
                            break;
                        case 'AVG':
                            if (current_group_result[aggregation_keys[ak]]) {
                                current_group_result[aggregation_keys[ak]] =
                                    ((current_group_result[aggregation_keys[ak]] * current_group_result[aggregation_keys[ak] + "__avgcnt__"]) +
                                    result[i][val]) / ++current_group_result[aggregation_keys[ak] + "__avgcnt__"];
                            }
                            else {
                                current_group_result[aggregation_keys[ak]] = result[i][val];
                                current_group_result[aggregation_keys[ak] + "__avgcnt__"] = 1;
                            }
                            break;
                        case 'MAX':
                            if (current_group_result[aggregation_keys[ak]]) {
                                if (current_group_result[aggregation_keys[ak]] < result[i][val]) {
                                    current_group_result[aggregation_keys[ak]] = result[i][val];
                                }
                            }
                            else {
                                current_group_result[aggregation_keys[ak]] = result[i][val]
                            }
                            break;
                        case 'MIN':
                            if (current_group_result[aggregation_keys[ak]]) {
                                if (current_group_result[aggregation_keys[ak]] > result[i][val]) {
                                    current_group_result[aggregation_keys[ak]] = result[i][val];
                                }
                            }
                            else {
                                current_group_result[aggregation_keys[ak]] = result[i][val]
                            }
                            break;
                        default:
                            break;
                    }
                }
                if (i === result.length - 1) {
                    temp = {};
                    // filter the keys in each entry
                    for (k = 0; k < groupby.length; k++) {
                        temp[groupby[k]] = current_group_result[groupby[k]];
                    }
                    for (k = 0; k < new_aggregation.length; k++) {
                        t10 = new_aggregation[k][0] + '(' + new_aggregation[k][1] + ')';
                        res10 = current_group_result[t10];
                        if (new_aggregation[k][2]) {
                            t10 = new_aggregation[k][2];
                        }
                        temp[t10] = res10;
                    }
                    query_result.push(temp);
                    current_group_result = {};
                    current_group_result[groupby[g]] = result[i][[groupby[g]]];
                }
            }
            query_result = dedup(query_result, outtemp);
            return {"table_name": "table_result", "data": query_result, 'name': 'table', 'attributes': outtemp};
        }
    }
    return null;
};
query_operators['Rename'] = function () {
    var result = this.getChildBlocks()[0];
    if (result) {
        result = result.get_query();
        if (result != null) {
            var attrs = result['attributes'].slice(0);
            result = result['data'];
            var operation1 = this.getInputText(), tname = operation1['rel'];
            try {
                var renames = parserRename.parse(operation1['attr']);
            } catch (e) {
                return null
            }
            for (var i = 0; i < renames.length; i++) {
                if (attrs.indexOf(renames[i][1]) != -1) {
                    this.error("Attribute already exists");
                    return null;
                }
                if (typeof(renames[i][0]) == 'number') {
                    try {
                        renames[i][0] = attrs[renames[i][0] - 1]
                    } catch (e) {
                        return null;
                    }
                } else {
                    renames[i][0] = renames[i][0].toUpperCase();
                }
                renames[i][1] = renames[i][1].toUpperCase();
            }
            var map = {};
            for (i = 0; i < attrs.length; i++) {
                map[attrs[i]] = attrs[i];
            }
            for (i = 0; i < renames.length; i++) {
                var rename = renames[i];
                var original = rename[0];
                map[original] = rename[1];
            }
            var entry, new_entry, found;
            var data = [];
            for (i = 0; i < result.length; i++) {
                entry = result[i];
                new_entry = {};
                $.each(entry, function (k, v) {
                    new_entry[map[k]] = v;
                });
                data.push(new_entry)
            }
            var new_name = tname || result['name'];
            for (i = 0; i < renames.length; i++) {
                attrs[attrs.indexOf(renames[i][0])] = renames[i][1];
            }
            return {"table_name": "table_result", "data": data, "name": new_name, 'attributes': attrs};
//            }
        }
    }
    return null;
};
query_operators['NaturalJoin'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        var data = [];
        if (left_data && right_data) {
            left_data = left_data.get_query();
            right_data = right_data.get_query();
            if (left_data != null && right_data != null) {
                var left_attrs = left_data['attributes'], right_attrs = right_data['attributes'];
                left_data = left_data['data'];
                right_data = right_data['data'];
                var keys;
//                var left_keys = [], right_keys = [], keys;
//                $.each(left_data[0], function(k, v){left_keys.push(k)});
//                $.each(right_data[0], function(k, v){right_keys.push(k)});
                keys = left_attrs.filter(function (k) {
                    return right_attrs.indexOf(k) != -1
                }); //common attributes
                console.log(keys);
                if (keys.length != 0) {
                    left_data.forEach(function (l_entry) {
                        right_data.forEach(function (r_entry) {
                            if (!full_cmp(l_entry, r_entry, keys)) {
                                data.push($.extend({}, l_entry, r_entry));
                            }
                        })
                    });
//                            var matches = keys.filter(function(k){return l_entry[k] == r_entry[k]});
//                            if (matches.length == keys.length) {
//                                data.push($.extend({}, l_entry, r_entry));})});
                    right_attrs = right_attrs.filter(function (k) {
                        return left_attrs.indexOf(k) == -1
                    });
                    var attrs = left_attrs.concat(right_attrs);
                    if (data.length > 0) {
                        data = dedup(data, attrs);
                    }


                    return {"table_name": "table_result", "data": data, 'name': 'table', 'attributes': attrs};


                }
                this.error('Both tables need to have at least one attribute in common');
            }
        }
    }
    return null;
};
function binaryRelation(a, op, b) {
    switch (op) {
        case '<':
            return a < b;
            break;
        case '<=':
            return a <= b;
            break;
        case '=':
            return a == b;
            break;
        case '<>':
            return a != b;
            break;
        case '>=':
            return a >= b;
            break;
        case '>':
            return a > b;
            break;
        default:
            return false;
    }
}
query_operators['ThetaJoin'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        var data = [];
        if (left_data && right_data) {
            left_data = left_data.get_query();
            right_data = right_data.get_query();
            if (left_data != null && right_data != null) {
                var left_attrs = left_data['attributes'], right_attrs = right_data['attributes'];
                left_data = left_data['data'];
                right_data = right_data['data'];
                var matches = right_attrs.filter(function (k) {
                    return left_attrs.indexOf(k) != -1
                });
                if (matches == 0) {
                    var attrs = left_attrs.concat(right_attrs);
                    var operation = this.getInputText();
                    try {
                        var comparisons = parser.parse(operation);
                    } catch (err) {
                        this.error('Query input is incorrect');
                        console.log(err);
                        return null;
                    }
                    console.log('theta join about to run');
                    for (var i = 0; i < left_data.length; i++) {
                        for (var ii = 0; ii < right_data.length; ii++) {
                            var entry = $.extend({}, left_data[i], right_data[ii]);
                            if (validate(comparisons, entry)) {
                                data.push(entry);
                            }
                        }
                    }
                    data = dedup(data, attrs);
                    return {"table_name": "table_result", "data": data, 'name': 'table', 'attributes': attrs};
                }
                else {
                    this.error('Tables must have disjoint headers.');
                }
            }
        }
    }
    return null;
};
query_operators['ProductJoin'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        var data = [];
        if (left_data && right_data) {
            left_data = left_data.get_query();
            right_data = right_data.get_query();
            if (left_data != null && right_data != null) {
                var left_keys = left_data['attributes'], right_keys = right_data['attributes'], keys;
                left_data = left_data['data'];
                right_data = right_data['data'];
                console.time('cross_product');
                keys = left_keys.filter(function (k) {
                    return right_keys.indexOf(k) != -1
                });
                if (keys.length == 0) {
                    for (var i = 0; i < left_data.length; i++) {
                        for (var j = 0; j < right_data.length; j++) {
                            data.push($.extend({}, left_data[i], right_data[j]));
                        }
                    }
                    var attributes = left_keys.concat(right_keys);
                    console.timeEnd('cross_product');
                    data = dedup(data, attributes);
                    return {"table_name": "table_result", "data": data, 'name': 'table', 'attributes': attributes};
                }
                else {
                    this.error('Tables must have disjoint headers.')
                }
            }
        }
    }
    return null;
};
query_operators['Union'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        var data = [];
        if (left_data && right_data) {
            left_data = left_data.get_query();
            right_data = right_data.get_query();
            if (left_data != null && right_data != null) {
                var left_attrs = left_data['attributes'], right_attrs = right_data['attributes'];
                var matches = left_attrs.filter(function (attr) {
                    return right_attrs.indexOf(attr) == -1
                });
                if (matches.length == 0) {
                    left_data = left_data['data'];
                    right_data = right_data['data'];
                    var temp = left_data.concat(right_data);
                    temp = temp.sort(function (a, b) {
                        return full_cmp(a, b, left_attrs);
                    });
                    var last = temp[0];
                    data.push(temp[0]);
                    for (var i = 1; i < temp.length; i++) {
                        if (full_cmp(last, temp[i], left_attrs) != 0) {
                            data.push(temp[i]);
                            last = temp[i];
                        }
                    }
                    return {"table_name": "table_result", "data": data, 'name': 'table', 'attributes': left_attrs};
                }
                else {
                    this.error('Both tables must have same schema.');
//                    alert('must have same schema');
                }
            }
        }
    }
    return null;
};
query_operators['Intersection'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        var data = [];
        if (left_data && right_data) {
            left_data = left_data.get_query();
            right_data = right_data.get_query();
            if (left_data != null && right_data != null) {
                var left_attrs = left_data['attributes'], right_attrs = right_data['attributes'];
                var matches = left_attrs.filter(function (attr) {
                    return right_attrs.indexOf(attr) == -1
                });
                if (matches.length == 0) {
                    left_data = left_data['data'];
                    right_data = right_data['data'];
                    var temp = left_data.concat(right_data);
                    temp = temp.sort(function (a, b) {
                        return full_cmp(a, b, left_attrs)
                    });
                    for (var i = 1; i < temp.length; i++) {
                        if (full_cmp(temp[i - 1], temp[i], left_attrs) == 0) {
                            data.push(temp[i]);
                        }
                    }
                    return {"table_name": "table_result", "data": data, 'name': 'table', 'attributes': left_attrs};
                }
                else {
                    this.error('Both tables must have same schema.')
                }
            }
        }
    }
    return null;
};
query_operators['Difference'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        var data = [];
        if (left_data && right_data) {
            left_data = left_data.get_query();
            right_data = right_data.get_query();
            if (left_data != null && right_data != null) {
                var left_attrs = left_data['attributes'], right_attrs = right_data['attributes'];
                var matches = left_attrs.filter(function (attr) {
                    return right_attrs.indexOf(attr) == -1
                });
                if (matches.length == 0 && left_attrs.length == right_attrs.length) {
                    left_data = left_data['data'];
                    right_data = right_data['data'];
                    left_data.sort(function (a, b) {
                        return full_cmp(a, b, left_attrs)
                    });
                    right_data.sort(function (a, b) {
                        return full_cmp(a, b, left_attrs)
                    });

                    for (var i = 0; i < left_data.length; i++) {
                        var found = false;
                        for (var j = 0; j < right_data.length; j++) {
                            var diff = full_cmp(left_data[i], right_data[j], left_attrs);
                            if (diff == 0) {
                                found = true;
                            }
                        }
                        if (found == false) {
                            data.push(left_data[i]);
                        }
                    }
                    return {"table_name": "table_result", "data": data, 'name': 'table', 'attributes': left_attrs};
                }
                else {
                    this.error('Both tables must have same schema.')
                }
            }
        }
    }
    return null;
};

var relalg_operators = {};
relalg_operators['Select'] = function () {
    var result = this.getChildBlocks()[0];
    if (result) {
        var viewIsChildren = true;
        result = result.get_relalg(viewIsChildren);
        if (result != null) {
            result = result['relalg'];
//            var comparisons = parseSelect(this.getInputText());
            var text = this.getInputText();
//            text = text.replace('<', '&lt;');
//            text = text.replace('>', '&gt;');
//            var comparisons = parserSelect.parse(text);
//            if(Array.isArray(comparisons)){
//                comparisons = comparisons[0];
//            }
//            var data = sift(comparisons, result);
//            if(data.length > 0){
//                return {"table_name": "table_result", "data": data};}}
//            else{
//                return null;
            return {'relalg': 'SELECT ' + text + ' (' + result + ')'};
        }
    }
    return null;
};
relalg_operators['Project'] = function () {
    var result = this.getChildBlocks()[0];
    if (result) {
        var viewIsChildren = true;
        result = result.get_relalg(viewIsChildren);
        if (result != null) {
            result = result['relalg'];
            var text;
            try {
                text = parserProject.parse(this.getInputText()).join(',');
            } catch (e) {
                text = "";
            }

//            var text = this.getInputText();
//            while (text.indexOf(' ') != -1){
//                text = text.replace(' ', ',');
//            }
            return {'relalg': 'PROJECT ' + text + ' (' + result + ')'};
        }
    }
    return null;
};
relalg_operators['GroupBy'] = function () {
    var result = this.getChildBlocks()[0];
    if (result) {
        var viewIsChildren = true;
        result = result.get_relalg(viewIsChildren);
        if (result != null) {
            result = result['relalg'];
            var inputs = this.children.filter(function (child) {
                return child instanceof InputMorph
            });
            var temp1 = detect(inputs[0].children, function (child) {
                return child instanceof StringMorph
            });
            var temp2 = detect(inputs[1].children, function (child) {
                return child instanceof StringMorph
            });
            var t = temp2.text.split(',');
            for (var i = 0; i < t.length; i++) {
                var tt = t[i].split(' ');
                if (tt.length == 3) {
                    t[i] = tt[0];
                }
            }
            var text = {'group': temp1.text, 'aggregation': t.join(',')};
//            var text = {'group': temp1.text, 'aggregation': temp2.text};
            return {'relalg': text['group'] + ' GROUP ' + text['aggregation'] + ' (' + result + ')'};
        }
    }
    return null;
};
relalg_operators['Rename'] = function () {
    var result = this.getChildBlocks()[0];
    if (result) {
        var viewIsChildren = true;
        result = result.get_relalg(viewIsChildren);
        if (result != null) {
            result = result['relalg'];
            var text = this.getInputText(), tname = text['rel'];
            var ntname = tname || result;
            var nrel = '';
            try {
                var renames = parserRename.parse(text['attr']);
            } catch (e) {
            }

            if (renames) {
                for (var i = 0; i < renames.length; i++) {
                    nrel = renames[i][0] + '->' + renames[i][1];
                }
            }

            return {'relalg': 'Rename ' + nrel + ' (' + ntname + ')'};
        }
    }
    return null;
};
relalg_operators['NaturalJoin'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        if (left_data && right_data) {
            var viewIsChildren = true;
            left_data = left_data.get_relalg(viewIsChildren);
            right_data = right_data.get_relalg(viewIsChildren);
            if (left_data != null && right_data != null) {
                left_data = left_data['relalg'];
                right_data = right_data['relalg'];
                return {'relalg': ' (' + left_data + ')' + ' NJOIN ' + ' (' + right_data + ')'};
            }
        }
    }
    return null;
};
relalg_operators['ThetaJoin'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        if (left_data && right_data) {
            var viewIsChildren = true;
            left_data = left_data.get_relalg(viewIsChildren);
            right_data = right_data.get_relalg(viewIsChildren);
            if (left_data != null && right_data != null) {
                left_data = left_data['relalg'];
                right_data = right_data['relalg'];
                return {'relalg': ' (' + left_data + ')' + ' Theta Join ' + ' (' + right_data + ')'};
            }
        }
    }
    return null;
};
relalg_operators['ProductJoin'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        if (left_data && right_data) {
            var viewIsChildren = true;
            left_data = left_data.get_relalg(viewIsChildren);
            right_data = right_data.get_relalg(viewIsChildren);
            if (left_data != null && right_data != null) {
                left_data = left_data['relalg'];
                right_data = right_data['relalg'];
                return {'relalg': ' (' + left_data + ')' + ' PRODUCT ' + ' (' + right_data + ')'};
            }
        }
    }
    return null;
};
relalg_operators['Union'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        if (left_data && right_data) {
            var viewIsChildren = true;
            left_data = left_data.get_relalg(viewIsChildren);
            right_data = right_data.get_relalg(viewIsChildren);
            if (left_data != null && right_data != null) {
                left_data = left_data['relalg'];
                right_data = right_data['relalg'];
                return {'relalg': ' (' + left_data + ')' + ' UNION ' + ' (' + right_data + ')'};
            }
        }
    }
    return null;
};
relalg_operators['Intersection'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        if (left_data && right_data) {
            var viewIsChildren = true;
            left_data = left_data.get_relalg();
            right_data = right_data.get_relalg();
            if (left_data != null && right_data != null) {
                left_data = left_data['relalg'];
                right_data = right_data['relalg'];
                return {'relalg': ' (' + left_data + ')' + ' INTERSECTION ' + ' (' + right_data + ')'};
            }
        }
    }
    return null;
};
relalg_operators['Difference'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        if (left_data && right_data) {
            var viewIsChildren = true;
            left_data = left_data.get_relalg(viewIsChildren);
            right_data = right_data.get_relalg(viewIsChildren);
            if (left_data != null && right_data != null) {
                left_data = left_data['relalg'];
                right_data = right_data['relalg'];
                return {'relalg': ' (' + left_data + ')' + ' DIFFERENCE ' + ' (' + right_data + ')'};
            }
        }
    }
    return null;
};

//start here
var children_operators = {};
children_operators['Select'] = function () {
    var result = this.getChildBlocks()[0];
    if (result) {
        return result;
    }
    return null;
};
children_operators['Project'] = function () {
    var result = this.getChildBlocks()[0];
    if (result) {
        return result;
    }
    return null;
};
children_operators['GroupBy'] = function () {
    var result = this.getChildBlocks()[0];
    if (result) {
        return result;
    }
    return null;
};
children_operators['Rename'] = function () {
    var result = this.getChildBlocks()[0];
    if (result) {
        return result;
    }
    return null;
};
children_operators['NaturalJoin'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        if (left_data && right_data) {

            if (left_data != null && right_data != null) {
                return children_data;
            }
        }
    }
    return null;
};
children_operators['ThetaJoin'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        if (left_data && right_data) {
            left_data = left_data.get_relalg();
            right_data = right_data.get_relalg();
            if (left_data != null && right_data != null) {

                return children_data;
            }
        }
    }
    return null;
};
children_operators['ProductJoin'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        if (left_data && right_data) {
            left_data = left_data.get_relalg();
            right_data = right_data.get_relalg();
            if (left_data != null && right_data != null) {

                return children_data;
            }
        }
    }
    return null;
};
children_operators['Union'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        if (left_data && right_data) {
            left_data = left_data.get_relalg();
            right_data = right_data.get_relalg();
            if (left_data != null && right_data != null) {
                return children_data;
            }
        }
    }
    return null;
};
children_operators['Intersection'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        if (left_data && right_data) {
            left_data = left_data.get_relalg();
            right_data = right_data.get_relalg();
            if (left_data != null && right_data != null) {
                return children_data;
            }
        }
    }
    return null;
};
children_operators['Difference'] = function () {
    var children_data = this.nextBlocks(),
        left_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_left'
        }),
        right_data = detect(children_data, function (child) {
            return child.blockPosition === 'bottom_right'
        });
    if (children_data.length === 2) {
        if (left_data && right_data) {
            left_data = left_data.get_relalg();
            right_data = right_data.get_relalg();
            if (left_data != null && right_data != null) {
                return children_data;
            }
        }
    }
    return null;
};
//end here

var RunQueryMorph;
RunQueryMorph.prototype = new Morph();
RunQueryMorph.prototype.constructor = RunQueryMorph;
RunQueryMorph.uber = Morph.prototype;
function RunQueryMorph() {
    this.init()
}
RunQueryMorph.prototype.init = function () {
    RunQueryMorph.uber.init.call(this);
    this.radius = 25;
    this.setExtent(new Point(50, 50));
};
RunQueryMorph.prototype.drawNew = function () {
    var context;
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    // draw circle
    drawCircle(context, this.radius, this.radius, this.radius, (new Color(210, 240, 210)).toString());
    //draw right facing equilateral triangle
    drawEqTriangle(context, 47, 25, 13, 25, 'green');

};
RunQueryMorph.prototype.mouseClickLeft = function () {
    var script = this.parentThatIsA(ScrollFrameMorph).contents;
    var roots = script.children.filter(function (child) {
        return child instanceof BaseBlockMorph;
    });
    if (roots.length === 1) {
        var gui = this.parentThatIsA(GuiMorph);
        var textbox = gui.textbox;
        var query = roots[0].get_relalg();
        if (query) {
            textbox.setText(query['relalg']);
        }
        var result = roots[0].get_query();
        if (result) {
            ScriptMorph.prototype.createTable("table_result", result.data, null, this);
        }
    }
};


var ZoomMorph;
ZoomMorph.prototype = new Morph();
ZoomMorph.prototype.constructor = ZoomMorph;
ZoomMorph.uber = Morph.prototype;
function ZoomMorph(zoom_type) {
    this.init(zoom_type)
}
ZoomMorph.prototype.init = function (zoom_type) {
    ZoomMorph.uber.init.call(this);
    this.zoom_type = zoom_type;
    this.setExtent(new Point(50, 50));
};
ZoomMorph.prototype.drawNew = function () {
    var context;
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    context.fillStyle = (new Color(100, 150, 255)).toString();
    //draw top outer circle
    context.beginPath();
    var temp = 15;
    context.arc(temp, temp, temp, 0, 2 * Math.PI);
    context.fill();
    context.closePath();
    context.fillStyle = 'white';
    context.beginPath();
    context.arc(temp, temp, temp - 2, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    //draw handle
    context.fillStyle = (new Color(100, 150, 255)).toString();
    context.beginPath();
    context.moveTo(25, 23); // bottom left point
    context.lineTo(50, 45); // top left  point
    context.lineTo(45, 50); // middle right point
    context.lineTo(23, 25);
    context.closePath();
    context.fill();
    // draw zoom symbol horizontal
    context.beginPath();
    context.moveTo(6, 13);
    context.lineTo(25, 13);
    context.lineTo(25, 16);
    context.lineTo(6, 16);
    context.closePath();
    context.fill();
    if (this.zoom_type === 'in') {
        context.beginPath();
        context.moveTo(17, 5);
        context.lineTo(17, 25);
        context.lineTo(14, 25);
        context.lineTo(14, 5);
        context.closePath();
        context.fill();
    }
};


var ArrowMorph;
ArrowMorph.prototype = new Morph();
ArrowMorph.prototype.constructor = ArrowMorph;
ArrowMorph.uber = Morph.prototype;
function ArrowMorph(direction, size, padding, color) {
    this.init(direction, size, padding, color);
}
ArrowMorph.prototype.init = function (direction, size, padding, color) {
    this.direction = direction || 'down';
    this.size = size || ((size === 0) ? 0 : 50);
    this.padding = padding || 0;

    ArrowMorph.uber.init.call(this);
    this.color = color || new Color(0, 0, 0);
    this.setExtent(new Point(this.size, this.size));
};
ArrowMorph.prototype.setSize = function (size) {
    var min = Math.max(size, 1);
    this.size = size;
    this.setExtent(new Point(min, min));
};
ArrowMorph.prototype.drawNew = function () {
    // initialize my surface property
    this.image = newCanvas(this.extent());
    var context = this.image.getContext('2d'),
        pad = this.padding,
        h = this.height(),
        h2 = Math.floor(h / 2),
        w = this.width(),
        w2 = Math.floor(w / 2);

    context.fillStyle = this.color.toString();
    context.beginPath();
    if (this.direction === 'down') {
        context.moveTo(pad, h2);
        context.lineTo(w - pad, h2);
        context.lineTo(w2, h - pad);
    } else if (this.direction === 'up') {
        context.moveTo(pad, h2);
        context.lineTo(w - pad, h2);
        context.lineTo(w2, pad);
    } else if (this.direction === 'left') {
        context.moveTo(pad, h2);
        context.lineTo(w2, pad);
        context.lineTo(w2, h - pad);
    } else { // 'right'
        context.moveTo(w2, pad);
        context.lineTo(w - pad, h2);
        context.lineTo(w2, h - pad);
    }
    context.closePath();
    context.fill();
};
ArrowMorph.prototype.mouseClickLeft = function () {
    console.log(this + ':mouseClickLeft');
    this.escalateEvent('dropDownMenu');
};

function mouse_wait() {
    document.getElementById('body').style.cursor = 'wait'
}
function mouse_auto() {
    document.getElementById('body').style.cursor = 'auto'
}

var ScriptMorph;
ScriptMorph.prototype = new FrameMorph();
ScriptMorph.prototype.constructor = ScriptMorph;
ScriptMorph.uber = FrameMorph.prototype;
function ScriptMorph(owner) {
    this.init(owner);
}
ScriptMorph.prototype.init = function (owner) {
    this.owner = owner || null;
    ScriptMorph.uber.init.call(this);
//    this.setColor('blue');
    this.lastDroppedBlock = null;
    this.lastDropTarget = null;
};
ScriptMorph.prototype.step = function () {
    var hand = this.world().hand, block;
    if (hand.children.length === 0) {
        return null;
    }
    if (!this.bounds.containsPoint(hand.bounds.origin)) {
        return null;
    }
    block = hand.children[0];
    if (!(block instanceof BaseBlockMorph)) {
        return null;
    }
    if (!contains(hand.morphAtPointer().allParents(), this)) {
        return null;
    }
//    if(block instanceof OperatorMorph){
//        this.showOperatorDropFeedback(block);
//    }
};
ScriptMorph.prototype.showOperatorDropFeedback = function (block) {
    var y, target;

    target = block.closestAttachTarget(this);
    if (!target) {
        return null;
    }
    this.add(this.feedbackMorph);
    this.feedbackMorph.border = 0;
    this.feedbackMorph.edge = 0;
    this.feedbackMorph.alpha = 1;
    this.feedbackMorph.setExtent(new Point(
        target.element.width(),
        Math.max(
            SyntaxElementMorph.prototype.corner,
            SyntaxElementMorph.prototype.feedbackMinHeight
        )
    ));
    this.feedbackMorph.color = this.feedbackColor;
    this.feedbackMorph.drawNew();
    this.feedbackMorph.changed();
    y = target.point.y;
    if (target.loc === 'bottom') {
        if (target.type === 'block') {
            if (target.element.nextBlock()) {
                y -= SyntaxElementMorph.prototype.corner;
            }
        } else if (target.type === 'slot') {
            if (target.element.nestedBlock()) {
                y -= SyntaxElementMorph.prototype.corner;
            }
        }
    }
    this.feedbackMorph.setPosition(new Point(
        target.element.left(),
        y
    ));
};
ScriptMorph.prototype.wantsDropOf = function (morph) {
    console.log('ScriptMorph:wantsDropOf');
    return morph instanceof BaseBlockMorph;
};
ScriptMorph.prototype.reactToDropOf = function (droppedMorph, hand) {

    droppedMorph.snap();
    //if (droppedMorph instanceof BaseBlockMorph){droppedMorph.snap(hand)}
    this.adjustBounds();
    this.queryUpdate();
//    var run = detect(this.parent.children, function (child){return child instanceof RunQueryMorph});
//    if (run){run.mouseClickLeft()}
//    run.mouseClickLeft();
};
ScriptMorph.prototype.clearDropHistory = function () {
    console.log('ScriptMorph:clearDropHistory');
    this.lastDroppedBlock = null;
    this.lastDropTarget = null;
};
ScriptMorph.prototype.fixLayout = function () {
    this.title.setCenter(new Point(this.left() + this.width() / 2, this.top() + 6));
};
ScriptMorph.prototype.queryUpdate = function () {
    var script = this.parentThatIsA(ScrollFrameMorph).contents;
    var roots = script.children.filter(function (child) {
        return child instanceof BaseBlockMorph;
    });
    var myself = this;
    var run_query = function () {
        var gui = myself.parentThatIsA(GuiMorph);
        var textbox = gui.textbox;
        if (roots.length === 1) {
            var query = roots[0].get_relalg();
            if (query) {
                textbox.setText(query['relalg']);
            }
            //Anthony Van Nieuwenhuyse 1376-1379 (Fixed display text when query error.)
            else {
                myself.createTable('table_data', null, null, myself);
                textbox.setText("Relation Algebra Expression:");
            }
            /*var queryChildren = roots[0].nextBlocks();

             for (var i = 0; i < queryChildren.length; i++) {
             if (queryChildren[i].isView) {
             queryChildren[i].data_set = queryChildren[i].queryParent.get_query();
             }
             }*/
            var result = roots[0].get_query();

            myself.createTable("table_result", result, null, myself);
        } else {
            myself.createTable('table_result', null, null, myself);
            textbox.setText("Relation Algebra Expression:");
        }
        if (roots.length < 1) {
            myself.createTable('table_data', null, null, myself);
            textbox.setText('Relation Algebra Expression:');
        }
    };
    this.nextSteps([mouse_wait, function () {
        setTimeout(run_query, 1)
    }, mouse_auto]);
};
ScriptMorph.prototype.createTable = function (name, data, operator, ele) {
    console.log(this);
    var wrapper, queryJSON, nodeJSON;
    var datasData = data !== null ? data.data : false;
    var dataLen = datasData.length || 0;

    if (name == "table_result") { // query results
        wrapper = $('#query-result-wrapper');
        if (data && dataLen > 0) { // result has data

            // show icons
            wrapper.find('.icons').fadeIn();

            // icon click functions
            wrapper.find('.open-table-icon').click(function () {
                $('#query-grid-modal').dialog('open');
            });
            wrapper.find('.open-chart-icon').click(function () {
                $('.chart-modal').dialog('open');
                $('.modal-data-type').val('query');
            });

            // add total to title
            wrapper.find('.count').html("(" + dataLen + (dataLen == 1 ? " row" : " rows") + ")");

            // config chart modal
            queryChartData = datasData;
            $('.chart-modal').dialog({
                autoOpen: false,
                height: $(window).height() / 2,
                width: "60vw",
                modal: true,
                title: "Query Result"
            }).find('.temp-opt').remove();
            $.each(data.attributes, function (key, val) {
                $('.chart-modal').find(".xAxis-opts, .yAxis-opts").append("<option class='temp-opt' value='" + val + "'>" + val + "</option>");
            });

            // prepare table data
            queryJSON = this.prepareJson(data, false);
            // fill table
            var queryGrid = new EditableGrid('query-result-container');
            queryGrid.tableLoaded = function () {
                this.renderGrid('query-result-container', "result-table");
            };
            queryGrid.processJSON(queryJSON);
            queryGrid.tableLoaded();

            // fill modal
            $('#query-grid-modal').dialog({
                autoOpen: false,
                height: $(window).height() / 2,
                width: "auto",
                modal: true,
                title: "Query Result"
            });
            var queryModalGrid = new EditableGrid('query-grid-modal');
            queryModalGrid.tableLoaded = function () {
                this.renderGrid('query-grid-modal', "result-modal");
            };
            queryModalGrid.processJSON(queryJSON);
            queryModalGrid.tableLoaded();

        } else { // result has no data

            // hide icons
            wrapper.find('.icons').fadeOut();

            // remove total from title
            wrapper.find('.count').html("");

            // remove any existing rows
            wrapper.find('.result-container').children().fadeOut(300, function () {
                $(this).remove();
            });

            //////$('#grid-modal').dialog("destroy");
        }
    }
    else {
        wrapper = $('#node-result-wrapper');
        var isDataSet = operator == "DataSet";
        if (datasData && dataLen > 0) {
            // show icons
            wrapper.find('.icons').fadeIn();
            // show add row icon if operator = dataSet
            if (isDataSet) {
                $(".open-chart-icon, .open-table-icon").fadeIn();
            } else {
                $('.add-row-icon').fadeOut();
            }

            // icon click functions
            wrapper.find('.open-table-icon').click(function () {
                $('#node-grid-modal').dialog('open');
            });
            wrapper.find('.open-chart-icon').click(function () {
                $('.chart-modal').dialog('open');
                $('.modal-data-type').val('node');
            });

            // add total to title
            wrapper.find('.count').html("(" + dataLen + (dataLen == 1 ? " row" : " rows") + ")");

            // config chart modal
            nodeChartData = datasData;
            $('.chart-modal').dialog({
                autoOpen: false,
                height: $(window).height() / 2,
                width: "60vw",
                modal: true,
                title: operator + " Result"
            }).find('.temp-opt').remove();
            $.each(data.attributes, function (key, val) {
                $('.chart-modal').find(".xAxis-opts, .yAxis-opts").append("<option class='temp-opt' value='" + val + "'>" + val + "</option>");
            });

            // config add row modal
            var addRowModal = $('#add-row-modal');
            addRowModal.dialog({
                autoOpen: false,
                height: "auto",
                width: "auto",
                modal: true,
                title: "Add New Data"
            });
            var addRowTable = addRowModal.find('table');
            // reset table content
            addRowTable.find('tr').remove();
            $.each(data.attributes, function (key, val) {
                var tableRow = "<tr><td>" + val + "</td><td><input type='text' class='add-row-value' data-attribute='" + val + "'></td></tr>";
                addRowTable.append(tableRow);
            });

            // prepare table data
            nodeJSON = this.prepareJson(data, isDataSet);
            // fill table
            var nodeGrid = new EditableGrid('node-result-container');
            nodeGrid.tableLoaded = function () {
                this.setCellRenderer("Delete", new CellRenderer({
                    render: function (cell, value) {
                        $(cell)
                            .html("<i class='fa fa-trash-o delete-row-icon' title='Delete row'></i>")
                            .find('i').bind('click', function () {
                            ele.parent.removeGridRow(this, data.name);
                        });
                    }
                }));
                this.renderGrid('node-result-container', "result-table");
            };
            nodeGrid.modelChanged = function (rowIndex, columnIndex, oldValue, newValue, row) {
                var newData = ele.parent.getUpdatedData(this, row, rowIndex, columnIndex, newValue);
                ele.parent.updateChildren(newData, data.name);
            };
            nodeGrid.loadJSONFromString(nodeJSON);
            nodeGrid.tableLoaded();

            wrapper.find('.add-row-icon').click(function () {
                addRowModal.dialog('open');
                $('#add-row-btn').click(function () {
                    var newGridRow = {};
                    addRowModal.find('table').find('.add-row-value').each(function () {
                        newGridRow[$(this).data('attribute')] = $(this).val();
                    });
                    ele.parent.addGridRow(newGridRow, data.name);
                    addRowModal.dialog('close');
                });
            });

            // fill modal
            $('#node-grid-modal').dialog({
                autoOpen: false,
                height: $(window).height() / 2,
                width: "auto",
                modal: true,
                title: operator + " Result"
            });
            var nodeModalGrid = new EditableGrid('node-grid-modal');
            nodeModalGrid.tableLoaded = function () {
                this.setCellRenderer("Delete", new CellRenderer({
                    render: function (cell, value) {
                        $(cell)
                            .html("<i class='fa fa-trash-o delete-row-icon' title='Delete row'></i>")
                            .find('i').bind('click', function () {
                            ele.parent.removeGridRow(this, data.name);
                        });
                    }
                }));
                this.renderGrid('node-grid-modal', "result-modal");
            };
            nodeModalGrid.modelChanged = function (rowIndex, columnIndex, oldValue, newValue, row) {
                if(typeof ele.parent.updateChildren == 'function'){
                    var newData = ele.parent.getUpdatedData(this, row, rowIndex, columnIndex, newValue);
                    ele.parent.updateChildren(newData, data.name);
                } else if(typeof ele.parent.parent.updateChildren == 'function'){
                    var newData = ele.parent.parent.getUpdatedData(this, row, rowIndex, columnIndex, newValue);
                    ele.parent.parent.updateChildren(newData, data.name);
                }
            };
            nodeModalGrid.loadJSONFromString(nodeJSON);
            nodeModalGrid.tableLoaded();

        } else {
            // hide icons
            wrapper.find('.icons').fadeOut();

            // remove total from title
            wrapper.find('.count').html("");

            // remove any existing rows
            wrapper.find('.result-container').children().fadeOut(300, function () {
                $(this).remove();
            });
        }
    }

    if (this.operator == "DataSet") {
        var strings = this.children.filter(function (morph) {
            return morph instanceof StringMorph
        });
        if (strings.length > 0) {
            for (i = 0; i < strings.length; i++) {
                title = strings[i];
                title.color = 'white';
                title.drawNew();
            }
        }
    }


};
ScriptMorph.prototype.getUpdatedData = function (grid, row, rowIndex, columnIndex, newValue) {
    return {
        'keyName': $(row).find('td').first().data('title'),
        'keyVal': grid.getValueAt(rowIndex, 0),
        'newCol': grid.getColumnName(columnIndex),
        'newVal': newValue
    };
};
ScriptMorph.prototype.updateChildren = function (newData, tableName) {
    $.each(this.children, function (i, child) {
        if (child.data_set && child.data_set.name == tableName) {
            $.each(child.data_set.data, function () {
                if (this[newData.keyName] == newData.keyVal) {
                    this[newData.newCol] = newData.newVal;
                }
            });
        }
        child.parent.queryUpdate();
        child.mouseClickLeft();
    });
};
ScriptMorph.prototype.prepareJson = function (data, isEditable) {
    var order = data.attributes;
    var rows = [];
    var datatypes = {};
    var fields = [];
    var i = 0;

    $.each(data.data, function () {
        var tempRow = this;
        var obj = {};
        $.each(this, function (key, val) {
            if (!datatypes[key]) { // set to true by default
                datatypes[key] = true;
            }
            if (isNaN(val)) {
                datatypes[key] = false; // if string set to false
            }
        });
        $.each(order, function () {
            obj[this] = tempRow[this];
        });
        if (isEditable) {
            obj.Delete = "";
        }
        rows.push({"id": i, "values": obj});
        i++;
    });

    // build fields array
    var j = 0;
    $.each(order, function () {
        j++;
        var field = this;
        $.each(datatypes, function (name, num) {
            if (field == name) {
                var obj = {};
                obj.name = name;
                obj.label = name;
                obj.datatype = num == true ? "double" : "string";
                obj.editable = j == 1 ? false : isEditable;
                fields.push(obj);
            }
        });
    });
    if (isEditable) {
        fields.push({
            "name": "Delete",
            "label": "Delete",
            "datatype": "html",
            "editable": false
        });
    }
    return {"metadata": fields, "data": rows};

};
ScriptMorph.prototype.addGridRow = function (newRow, tblName) {
    // check newRow content
    var err = false;
    $.each(newRow, function(key, val){
        console.log([key, val]);
        if(val == "") {
            err = true;
        }
    });
    if(!err) {
        var affectedChild = false;
        $.each(this.children, function (i, child) {
            if (child.data_set && child.data_set.name == tblName) {
                child.data_set.data.push(newRow);
                affectedChild = child;
            }
        });
        if (affectedChild) {
            affectedChild.parent.queryUpdate();
            affectedChild.mouseClickLeft();
        }
    }
};
ScriptMorph.prototype.removeGridRow = function (cell, tableName) {
    // select parent row of the clicked delete cell
    var row = $(cell).closest('tr');
    // obj of existing row data (minus the delete cell)
    var rowdata = {};
    // pop rowdata
    row.find('td').each(function () {
        if ($(this).data('title') !== "Delete") {
            rowdata[$(this).data('title')] = $(this).text();
        }
    });

    // find the row to delete in ScriptMorph obj.data
    $.each(this.children, function (i, child) {
        removerow = false;
        if (child.data_set && child.data_set.name == tableName) {
            // find matching row
            $.each(child.data_set.data, function (i, row) {
                var match = true;
                $.each(this, function (key, val) {
                    if (rowdata[key] !== val.toString()) {
                        match = false;
                    }
                });
                if (match === true) {
                    removerow = i;
                }
            });
        }
        // remove the row from obj
        if (removerow !== false) {
            child.data_set.data.splice(removerow, 1);
        }
        // rerun query
        child.parent.queryUpdate();
        child.mouseClickLeft();
    });
};

var lastSelectedNode;
var BaseBlockMorph; // == BlockMorph
BaseBlockMorph.prototype = new Morph();
BaseBlockMorph.prototype.constructor = BaseBlockMorph;
BaseBlockMorph.uber = Morph.prototype;
function BaseBlockMorph() {
    this.init();
}
BaseBlockMorph.prototype.init = function () {
    BaseBlockMorph.uber.init.call(this);
    this.blockPosition = null;
};
BaseBlockMorph.prototype.userMenu = function () {
    console.log('BaseBlockMorph:userMenu');
    var menu = new MenuMorph(this), world = this.world(), myself = this, block;
    menu.addItem('help', 'showHelp');
    return menu;
};
BaseBlockMorph.prototype.attachPoints = function () {
    return [];
};
BaseBlockMorph.prototype.allAttachTargets = function (new_parent) {
    var myself = this, target = new_parent || this.parent, answer = [], top_blocks;
    // removes itself and templates from the list of children
    top_blocks = target.children.filter(function (child) {
        return (child !== myself) && child instanceof BaseBlockMorph && !child.isTemplate
    });
    // returns a list of mappings of every possible attach point. mapping has:element, loc, point
    top_blocks.forEach(function (block) {
        block.forAllChildren(function (child) {
            if (child.attachPoints) {
                child.attachPoints().forEach(function (attach_point) {
                    answer.push(attach_point);
                })
            }
        })
    });
    return answer;
};
BaseBlockMorph.prototype.closestAttachTarget = function (new_parent) {

    var target = new_parent || this.parent, dist, minDist = 1000, answer = null, threshold = 25;
    // assigns to ref all the attach points for this block
    var ref = this.attachPoints();
    // iterates through the list of every possible attach point
    this.allAttachTargets(target).forEach(function (each_target) {
        ref.forEach(function (each_ref) {
            if (each_ref.loc !== each_target.loc) {
                dist = each_ref.point.distanceTo(each_target.point);
                if ((dist < threshold) && (dist < minDist)) {
                    each_target["source_loc"] = each_ref;
                    minDist = dist;
                    answer = each_target;
                }
            }
        })
    });
    return answer;
};
BaseBlockMorph.prototype.mouseClickLeft = function () {
    var i, title, strings, children, j;
    var gui = this.parentThatIsA(GuiMorph);
    if (lastSelectedNode) {
        strings = lastSelectedNode.children.filter(function (child) {
            return child instanceof StringMorph
        });
        for (i = 0; i < strings.length; i++) {
            title = strings[i];
            title.color = 'white';
            title.drawNew();
        }
        lastSelectedNode.changed();
    }
    strings = this.children.filter(function (morph) {
        return morph instanceof StringMorph
    });
    if (strings.length > 0) {
        for (i = 0; i < strings.length; i++) {
            title = strings[i];
            if (!(this.isTemplate)) {
                if (this.operator == "Select")
                    title.color = 'yellow';
                else
                    title.color = 'red';
            } else {
                if ((this.operator == "DataSet") || (this.operator == "View")) {
                    title.color = 'red';
                }
            }
            title.drawNew();
        }
        lastSelectedNode = this;
    }
    var textbox = gui.textbox;
    var query = this.get_relalg();
    if (query) {
        textbox.setText(query['relalg']);
    } else {
        textbox.setText("Relation Algebra Expression:");
    }
    var result = this.get_query();
    ScriptMorph.prototype.createTable("table_data", result, this.operator, this);
};
BaseBlockMorph.prototype.getChildBlocks = function () {
    return this.children.filter(function (child) {
        return child instanceof BaseBlockMorph
    });
};
BaseBlockMorph.prototype.getInputMorph = function () {
    return detect(this.children, function (child) {
        return child instanceof InputMorph;
    });
//    var operator = detect(input.children, function(child){return child instanceof StringMorph});
//    return input;
};
BaseBlockMorph.prototype.getInputText = function () {
    var inputs = this.children.filter(function (child) {
        return child instanceof InputMorph
    });
    if (inputs.length == 1) {
        return detect(inputs[0].children, function (child) {
            return child instanceof StringMorph
        }).text;
    }
    else {
        var group = detect(inputs[0].children, function (child) {
            return child instanceof StringMorph
        });
        var out = detect(inputs[1].children, function (child) {
            return child instanceof StringMorph
        });
        return {'rel': group.text, 'attr': out.text};
//        return group.text + '|' + out.text;
    }
};
BaseBlockMorph.prototype.nextBlocks = function (block) {
    if (block) {
        this.add(block);
    }
    else {
        return this.children.filter(function (child) {
            return child instanceof BaseBlockMorph
        })
    }
};
BaseBlockMorph.prototype.hint = function (msg) {
    var m, text;
    text = msg;
    if (msg) {
        if (msg.toString) {
            text = msg.toString();
        }
    } else {
        text = 'NULL';
    }
    m = new MenuMorph(this, text);
    m.isDraggable = true;
    m.popup(this.world(), new Point(this.left() + 25, this.top() + 25));
};
BaseBlockMorph.prototype.error = function (msg) {
    var gui = this.parentThatIsA(GuiMorph);
    var textbox = gui.textbox;
    var text = textbox.text;
    textbox.setText('Error: ' + msg + '\n' + text);

};

//modifications start here (Michell)
BaseBlockMorph.prototype.contextMenu = function () {
    var menu;
    var script = this.parentThatIsA(ScriptMorph);

    if (script) {

        menu = new MenuMorph(this, 'Select an Option');

        menu.addItem("Create View...", 'createView');

        menu.addItem("Save Query...", 'saveQuery');

        menu.addItem("Save Query Result...", "saveQueryResult");

    } else {

        nop();

    }

    return menu;
};

BaseBlockMorph.prototype.createView = function (fromIcon) {

    var block = this;
    if (fromIcon)
        block = lastSelectedNode;

    if (block != null) {
        var gui = block.parentThatIsA(GuiMorph);

        var data = block.get_query();
        var parent = block.fullCopy();

        var name = window.prompt("Save view as...", "view1");

        if (name != null) {
            if (data) {
                gui.addDataSetTable(null, name, parent);
            } else {
                var textbox = gui.textbox;
                textbox.setText('Can NOT create view. Query input is incorrect');

            }
        }
    }

};

BaseBlockMorph.prototype.saveQuery = function (startBlock) {
    var script = this.parentThatIsA(GuiMorph);
    var file = '';

    var topParent = this;
    if (startBlock != null)
        topParent = startBlock;

    var isTop = topParent.parent instanceof ScriptMorph;
    while (!isTop) {
        topParent = topParent.parent;
        var isTop = topParent.parent instanceof ScriptMorph;
    }

    file = this.getBlockInformation(topParent);

    if (/^((?!chrome).)*safari/i.test(navigator.userAgent)) {
        alert('Your file will be open in another tab, click "Command + S" to save, use the extension ".dbs" and the Format: Page Source.');
        var blob = new Blob([file], {type: "text/dbs;charset=utf-8"});
        saveAs(blob, '.dbs');
    }
    else {
        var name = window.prompt("Save Query in Downloads Folder as...", "query1");
        if (name != null) {
            var blob = new Blob([file], {type: "text/plain;charset=utf-8"});
            saveAs(blob, name + '.dbs');
        }
    }
};

BaseBlockMorph.prototype.getBlockInformation = function (block) {
    var json = '';
    var blocks = '{"blocks" : [';
    var dataSets = ', "data_sets": [';
    var index = 0;
    var queue = [];
    queue.push([0, block]);
    var currentBlock = queue.shift();
    while (currentBlock != null) {
        var children = currentBlock[1].getChildBlocks();
        var childrenIndex = [];
        var currentIndex = currentBlock[0];
        for (var i = 0; i < children.length; i++) {
            index++;
            queue.push([index, children[i]]);
            childrenIndex.push(index);
        }

        var inputText = '';
        try {
            inputText = currentBlock[1].getInputText();
            if (currentBlock[1].operator == "Rename" || currentBlock[1].operator == "Group") {
                inputText = inputText.rel + "|sep|" + inputText.attr;
            } else if (currentBlock[1].operator == "Select")
                inputText = inputText.replace(/"/g, "'");
        }
        catch (err) {
            inputText = '';
        }

        if (currentBlock[1].operator == "DataSet") {
            blocks += '{ "id":"' + currentIndex + '", "children":"' + childrenIndex + '", "operator":"DataSet",' +
                '"name":"' + currentBlock[1].allLeafs()[1].text + '", "fields":"' + inputText + '"},';

            dataSets += '{"attributes":' + JSON.stringify(currentBlock[1].data_set.attributes) + ', "data":' +
                JSON.stringify(currentBlock[1].data_set.data) + ', "name":"' + currentBlock[1].data_set.name + '"},';
        } else {
            var operator = currentBlock[1].operator;
            if (operator == "NaturalJoin" && currentBlock[1].fillColor == "Black")
                operator = "CrossProduct";
            else if (operator == "Union" && currentBlock[1].fillColor == "LightSeaGreen")
                operator = "Difference";
            else if (operator == "Union" && currentBlock[1].fillColor == "Chocolate")
                operator = "Intersection";

            blocks += '{ "id":"' + currentIndex + '", "children":"' + childrenIndex + '", "operator":"' + operator + '",' +
                '"name":"", "fields":"' + inputText + '"},';
        }
        currentBlock = queue.shift();
    }
    blocks = blocks.substring(0, blocks.length - 1);
    blocks += ' ]';
    if (dataSets.substring(dataSets.length - 1) == ",")
        dataSets = dataSets.substring(0, dataSets.length - 1);
    dataSets += ' ]';
    json += blocks;
    //json += dataSets;
    json += '}';

    return json;
};

BaseBlockMorph.prototype.saveQueryResult = function () {

    var gui = this.parentThatIsA(GuiMorph);
    var query = this.get_query();
    var file;


    var topParent = this;
    /*if(startBlock != null)
     topParent = startBlock;*/

    var isTop = topParent.parent instanceof ScriptMorph;
    while (!isTop) {
        topParent = topParent.parent;
        var isTop = topParent.parent instanceof ScriptMorph;
    }

    file = this.getQueryInformation(topParent, query);

    if (/^((?!chrome).)*safari/i.test(navigator.userAgent)) {
        alert('Your file will be open in another tab, click "Command + S" to save, use the extension ".xml" and the Format: Page Source.');
        var blob = new Blob([file], {type: "application/xml;charset=utf-8"});
        saveAs(blob, '.xml');
    }
    else {
        var name = window.prompt("Export Result Table to Downloads Folder as...", "result1");
        if (name != null) {
            var blob = new Blob([file], {type: "application/xml;charset=utf-8"});
            saveAs(blob, name + '.xml');
        }
    }


};


BaseBlockMorph.prototype.getQueryInformation = function (block, query) {

    var file = '<project name="DBSnap" app="Snap! 4.0, http://snap.berkeley.edu" version="1">' +
        '<notes/>' +
        '<thumbnail>data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAB4CAYAAAB1ovlvAAADCUlEQVR4Xu3VMU5bARRE0c8+TG+WQ8GGaLwh1gMLceFIFBENSTQeZSR03NrvPfn8K/vhdrvdDi8CI4EHAY7knf0UEKAQpgICnPI7LkANTAUEOOV3XIAamAoIcMrvuAA1MBUQ4JTfcQFqYCogwCm/4wLUwFRAgFN+xwWogamAAKf8jgtQA1MBAU75HRegBqYCApzyOy5ADUwFBDjld1yAGpgKCHDK77gANTAVEOCU33EBamAqIMApv+MC1MBUQIBTfscFqIGpgACn/I4LUANTAQFO+R0XoAamAgKc8jsuQA1MBQQ45XdcgBqYCghwyu+4ADUwFRDglN9xAWpgKiDAKb/jAtTAVECAU37HBaiBqYAAp/yOC1ADUwEBTvkdF6AGpgICnPI7LkANTAUEOOV3XIAamAoIcMrvuAA1MBUQ4Df8T09Px+vr6/Hy8jJ9QD/9uAD/8ISfn59/v/v+/n68vb0dj4+PP72J//r9BPgX7q8Rfv3o9Xr9DNLrPgEBCvC+gu6cFuA//gV/fHx8/uKdTqc7yY1/FRDgNz2cz+fjcrkc3/0Fy6gjIMCOoy2hgABDOGMdAQF2HG0JBQQYwhnrCAiw42hLKCDAEM5YR0CAHUdbQgEBhnDGOgIC7DjaEgoIMIQz1hEQYMfRllBAgCGcsY6AADuOtoQCAgzhjHUEBNhxtCUUEGAIZ6wjIMCOoy2hgABDOGMdAQF2HG0JBQQYwhnrCAiw42hLKCDAEM5YR0CAHUdbQgEBhnDGOgIC7DjaEgoIMIQz1hEQYMfRllBAgCGcsY6AADuOtoQCAgzhjHUEBNhxtCUUEGAIZ6wjIMCOoy2hgABDOGMdAQF2HG0JBQQYwhnrCAiw42hLKCDAEM5YR0CAHUdbQgEBhnDGOgIC7DjaEgoIMIQz1hEQYMfRllBAgCGcsY6AADuOtoQCAgzhjHUEBNhxtCUUEGAIZ6wjIMCOoy2hgABDOGMdAQF2HG0JBQQYwhnrCAiw42hLKCDAEM5YR0CAHUdbQgEBhnDGOgIC7DjaEgr8Atdp/Kj2NnoRAAAAAElFTkSuQmCC</thumbnail>' +
        '<stage name="Stage" width="480" height="360" ' +
        'costume="0" tempo="60" threadsafe="false" ' +
        'lines="round" ' +
        'codify="false" ' +
        'scheduled="false" id="1">' +
        '<pentrails>' + 'dta:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeAAAAFoCAYAAACPNyggAAAOhUlEQVR4Xu3VwQkAAAjEMN1/abewn7jAQRC64wgQIECAAIF3gX1fNEiAAAECBAiMAHsCAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQICLAfIECAAAECgYAAB+gmCRAgQICAAPsBAgQIECAQCAhwgG6SAAECBAgIsB8gQIAAAQKBgAAH6CYJECBAgIAA+wECBAgQIBAICHCAbpIAAQIECAiwHyBAgAABAoGAAAfoJgkQIECAgAD7AQIECBAgEAgIcIBukgABAgQIHLFxAWmhEwHPAAAAAElFTkSuQmCC ' + '</pentrails>' +
        '<costumes>' + '<list id="2"></list>' + '</costumes>' +
        '<sounds>' + '<list id="3"></list>' + '</sounds>' +
        '<variables></variables>' +
        '<blocks></blocks>' +
        '<scripts></scripts>' +
        '<sprites>' +
        '<sprite name="Sprite" idx="1" x="0" y="0" heading="90" scale="1" rotation="1" draggable="true" costume="0" color="80,80,80" pen="tip" id="8">' +
        '<costumes>' + '<list id="9"></list>' + '</costumes>' +
        '<sounds>' + '<list id="10"></list>' + '</sounds>' +
        '<variables></variables>' +
        '<blocks></blocks>' +
        '<scripts>' +
        '<script x="10" y="220">' +
        '<block s="reportNewList">' +
        '<list>';

    for (i = 0; i < query['data'].length; i++) {

        file = file + '<block s="reportNewList">' +
            '<list>';
        for (j = 0; j < query['attributes'].length; j++) {

            var attribute = query['attributes'][j];
            file = file + '<l>' + query['data'][i][attribute] + '</l>';

        }
        file = file +
            '</list>' +
            '</block>';
    }


    var file2 = '</list>' +
        '</block>' +
        '</script>' +
        '</scripts>' +
        '</sprite>' +
        '</sprites>' +
        '</stage>' +
        '<hidden></hidden>' +
        '<headers></headers>' +
        '<code></code>' +
        '<blocks></blocks>' +
        '<variables></variables>' +
        '</project>';

    file = file + file2;

    return file;

};

//end here


var OperatorMorph; // == CommandBlockMorph
OperatorMorph.prototype = new BaseBlockMorph();
OperatorMorph.prototype.constructor = OperatorMorph;
OperatorMorph.uber = BaseBlockMorph.prototype;
function OperatorMorph(op_name, query, input, color) {
    this.init(op_name, query, input, color);
}
OperatorMorph.prototype.init = function (op_name, query, input, color) {
    this.operator = op_name;
    this.radius = 25;
    this.bwidth = 3;
    this.new_color = color || 'black';
    this.gap_width = 5;
    this.conn_height = 15;
//    this.rect_width = null; //depends on the size of the input field
//    this.rect_width = 120;
//    this.setExtent(new Point(this.radius*2+this.rect_width+this.gap_width+this.bwidth, this.radius*5));
    var operation = new InputMorph(input);
    operation.setPosition(new Point(this.radius * 2 + this.bwidth + this.gap_width + 5, this.radius + 4));
    this.rect_width = operation.width() + 30;
    this.color = color || 'black';
    OperatorMorph.uber.init.call(this);
    this.color = color || 'black';
    this.add(operation);
//
//    this.setExtent(new Point(150, 125));
    var name = new StringMorph(op_name, null, null, true, null, null, null, null, 'white');
    name.setCenter(new Point(this.bwidth + this.radius, this.radius));
    this.add(name);
    this.isTemplate = true;
    this.get_relalg = relalg_operators[query];
    this.get_query = query_operators[query];

    this.get_children = children_operators[query];

    this.wasConnected = false;// Austin S., for determining if Block was connected on last call to .snap()
	this.lastParent = null;// Austin S., for logging the last parent this Block was connected to
	this.isNew = true;// Austin S., for determining if Block came straight from the template, preventing subsequent "moved" logs
};
OperatorMorph.prototype.drawNew = function () {
    console.log(this + ':drawNew');
    this.color = this.new_color;
    var context;
    this.silentSetExtent(new Point(this.radius * 2 + this.rect_width + this.gap_width + this.bwidth, this.radius * 5));
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    //draw top circle
    drawCircle(context, this.bwidth + this.radius, this.radius, this.radius, this.color);
    //draw middle stem
    drawStem(context, this.bwidth + this.radius, this.radius * 2, this.bwidth + this.radius, this.radius * 4, this.bwidth, this.color);
    //draw bottom arc
    drawTopArc(context, this.bwidth + this.radius, this.radius * 4 - this.bwidth, this.radius, this.bwidth, this.color);
    // draw rectangle
    drawOpRectangle(context, this.bwidth + this.radius, this.radius * 2, this.gap_width, this.conn_height, this.rect_width, this.radius, this.color);
};

OperatorMorph.prototype.attachPoints = function () {
    var points = [], width = 3;
    if (!(this.parent instanceof BaseBlockMorph)) {
        points.push({"element": this, "loc": "top", "point": new Point(this.left() + 25 + width, this.top())});
    }
    if (this.children.filter(function (child) {
            return child instanceof BaseBlockMorph
        }).length === 0) {
        points.push({"element": this, "loc": "bottom", "point": new Point(this.left() + 25 + width, this.top() + 100)});
    }
    return points;
};





OperatorMorph.prototype.snap = function () {

    //Alaura:  this updates the csv file whenever a operator block is moved to the QA, Select , project & groupby

   var target = this.closestAttachTarget(), script = this.parentThatIsA(ScriptMorph), next, offset_y, affected;

    script.clearDropHistory();
    script.lastDroppedBlock = this;

    //Austin S. Reimplemented
    if (target === null)
    {
    	if(this.wasConnected)
		{
			update_content(this.operator + "," + this.blockID + "," + "disconnected from" + "," + this.lastParent.operator + "," + this.lastParent.blockID);// Austin S.
			this.wasConnected = false;// Austin S.
			this.lastParent = null;// Austin S.
		}
		else
		{
			if(this.isNew)
			{
				update_content(this.operator + "," + this.blockID + "," + "moved");//Alaura, Austin S: Changed this.data_set.name to this.operator
			}
		}
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
        return;
    }
    else
	{
		update_content(this.operator  +","+ this.blockID + "," + "connected to" + "," + target.element.operator + "," + target.element.blockID)//Alaura, Austin S: Changed target.element.data_set.name to target.element.operator
		this.wasConnected = true;// Austin S.
		this.lastParent = target.element; //Austin S.
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
	}

    clickSound();
    script.lastDropTarget = target;
    this.setTop(target.point.y - (target.source_loc.point.y - this.top()));
    this.setLeft(target.point.x - (target.source_loc.point.x - this.left()));
    if (target.source_loc.loc === 'top') {
        this.blockPosition = target.loc;
        target.element.nextBlocks(this);
    }
    else if (target.source_loc.loc === 'bottom') {
        this.nextBlocks(target.element);
    }

};

OperatorMorph.prototype.fixLayout = function () {
    console.log(this + 'fixLayout');
    var input = detect(this.children, function (child) {
        return child instanceof InputMorph;
    });
//    var input_field = detect(input.children, function(child){return child instanceof StringMorph});
    this.rect_width = input.width() + 30;
    this.setExtent(new Point(this.radius * 2 + this.rect_width + this.gap_width + this.bwidth, this.radius * 5));
//    this.parentThatIsA(ScriptMorph).adjustBounds();
};
OperatorMorph.prototype.accept = function () {
    var script = this.parentThatIsA(ScriptMorph);
    if (script) {
        script.queryUpdate();
    }
//    this.mouseClickLeft();
};


var OperatorGroupByMorph; // == CommandBlockMorph
OperatorGroupByMorph.prototype = new BaseBlockMorph();
OperatorGroupByMorph.prototype.constructor = OperatorGroupByMorph;
OperatorGroupByMorph.uber = BaseBlockMorph.prototype;
function OperatorGroupByMorph(op_name, query, input, color, params) {
    this.init(op_name, query, input, color, params);
}
OperatorGroupByMorph.prototype.init = function (op_name, query, input, color, params) {
    this.operator = "Group";
    this.radius = 25;
    this.bwidth = 3;
    this.fillColor = color || "green";
    this.gap_width = 5;
    this.conn_height = 15;

    var inputParams;
    var group;
    var operation;
    if (typeof params === "undefined") {
        group = new InputMorph('Attrs', 'group');
        operation = new InputMorph('function(Attr)', 'out');
    }
    else {
        inputParams = params.split("|sep|");
        group = new InputMorph(inputParams[0], 'group');
        operation = new InputMorph(inputParams[1], 'out');
    }

    var label_group = new StringMorph('Group by:', null, null, true, null, null, null, null, 'white');
    label_group.setPosition(new Point(this.radius * 2 + this.bwidth + this.gap_width + 4, this.radius - 9));
    group.setPosition(new Point(label_group.right() + 3, this.radius - 9));
//    group.setPosition(new Point(this.radius*2+this.bwidth+this.gap_width+4, this.radius-9));
    var label_aggr = new StringMorph('Aggr:', null, null, true, null, null, null, null, 'white');
    label_aggr.setPosition(new Point(this.radius * 2 + this.bwidth + this.gap_width + 4, this.radius + 7));
    operation.setPosition(new Point(label_aggr.right() + 3, this.radius + 7));
//    operation.setPosition(new Point(this.radius*2+this.bwidth+this.gap_width+4, this.radius+7));
    this.rect_width = group.width() + 30 + label_group.width();
//    this.rect_width = group.width()+30;
    if (operation.width() + 30 > this.rect_width) {
        this.rect_width = operation.width() + 30;
    }
    OperatorGroupByMorph.uber.init.call(this);
    this.add(label_group);
    this.add(label_aggr);
    this.add(group);
    this.add(operation);
    var name = new StringMorph(op_name, null, null, true, null, null, null, null, 'white');
    name.setCenter(new Point(this.bwidth + this.radius, this.radius));
    this.add(name);
    this.isTemplate = true;
    this.get_relalg = relalg_operators[query];
    this.get_query = query_operators[query];

	this.wasConnected = false;// Austin S., for determining if Block was connected on last call to .snap()
	this.lastParent = null;// Austin S., for logging the last parent this Block was connected to
	this.isNew = true;// Austin S., for determining if Block came straight from the template, preventing subsequent "moved" logs
};
OperatorGroupByMorph.prototype.drawNew = function () {
    console.log(this + ':drawNew');
    this.color = this.fillColor;
    var context;
    this.silentSetExtent(new Point(this.radius * 2 + this.rect_width + this.gap_width + this.bwidth, this.radius * 5));
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    //draw top circle
    drawCircle(context, this.bwidth + this.radius, this.radius, this.radius, this.color);
    //draw middle stem
    drawStem(context, this.bwidth + this.radius, this.radius * 2, this.bwidth + this.radius, this.radius * 4, this.bwidth, this.color);
    //draw bottom arc
    drawTopArc(context, this.bwidth + this.radius, this.radius * 4 - this.bwidth, this.radius, this.bwidth, this.color);
    // draw rectangle
    drawOpRectangle(context, this.bwidth + this.radius, this.radius * 2, this.gap_width, this.conn_height, this.rect_width, this.radius + 10, this.color);
};
OperatorGroupByMorph.prototype.attachPoints = function () {
    var points = [], width = 3;
    if (!(this.parent instanceof BaseBlockMorph)) {
        points.push({"element": this, "loc": "top", "point": new Point(this.left() + 25 + width, this.top())});
    }
    if (this.children.filter(function (child) {
            return child instanceof BaseBlockMorph
        }).length === 0) {
        points.push({"element": this, "loc": "bottom", "point": new Point(this.left() + 25 + width, this.top() + 100)});
    }
    return points;
};
OperatorGroupByMorph.prototype.snap = function () {

    var target = this.closestAttachTarget(), script = this.parentThatIsA(ScriptMorph), next, offset_y, affected;
    script.clearDropHistory();
    script.lastDroppedBlock = this;

    //Austin S. Reimplemented
	if (target === null)
	{
		if(this.wasConnected)
		{
			update_content(this.operator + "," + this.blockID + "," + "disconnected from" + "," + this.lastParent.operator + "," + this.lastParent.blockID);// Austin S.
			this.wasConnected = false;// Austin S.
			this.lastParent = null;// Austin S.
		}
		else
		{
			if(this.isNew)
			{
				update_content(this.operator + "," + this.blockID + "," + "moved");//Alaura, Austin S: Changed this.data_set.name to this.operator
			}
		}
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
		return;
	}
	else
	{
		update_content(this.operator  +","+ this.blockID + "," + "connected to" + "," + target.element.operator + "," + target.element.blockID);//Alaura, Austin S: Changed target.element.data_set.name to target.element.operator
		this.wasConnected = true;// Austin S.
		this.lastParent = target.element; //Austin S.
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
	}

    clickSound();
    script.lastDropTarget = target;
    this.setTop(target.point.y - (target.source_loc.point.y - this.top()));
    this.setLeft(target.point.x - (target.source_loc.point.x - this.left()));
    if (target.source_loc.loc === 'top') {
        this.blockPosition = target.loc;
        target.element.nextBlocks(this);
    }
    else if (target.source_loc.loc === 'bottom') {
        this.nextBlocks(target.element);
    }
};
OperatorGroupByMorph.prototype.fixLayout = function () {
    console.log(this + 'fixLayout');
//    var input = detect(this.children, function(child){return child instanceof InputMorph;});
//    var input_field = detect(input.children, function(child){return child instanceof StringMorph});
    var inputs = this.children.filter(function (child) {
        return child instanceof InputMorph
    });
    this.rect_width = inputs[0].width() + 30 + 55;
    if (inputs[1].width() + 30 > this.rect_width) {
        this.rect_width = inputs[1].width() + 30 + 55;
    }
    this.setExtent(new Point(this.radius * 2 + this.rect_width + this.gap_width + this.bwidth, this.radius * 5));
    var script = this.parentThatIsA(ScriptMorph);
    if (script) {
        script.adjustBounds();
    }
//    this.parentThatIsA(ScriptMorph).adjustBounds();
};
OperatorGroupByMorph.prototype.accept = function () {
    var script = this.parentThatIsA(ScriptMorph);
    if (script) {
        script.queryUpdate();
    }
//    this.mouseClickLeft();
};


var OperatorRenameMorph; // == CommandBlockMorph
OperatorRenameMorph.prototype = new BaseBlockMorph();
OperatorRenameMorph.prototype.constructor = OperatorRenameMorph;
OperatorRenameMorph.uber = BaseBlockMorph.prototype;
function OperatorRenameMorph(op_name, query, input, color, params) {
    this.init(op_name, query, input, color, params);
}
OperatorRenameMorph.prototype.init = function (op_name, query, input, color, params) {
    this.operator = "Rename";
    this.radius = 25;
    this.bwidth = 3;
    this.fillColor = color || "green";
    this.gap_width = 5;
    this.conn_height = 15;

    var inputParams;
    var group;
    var operation;
    if (typeof params === "undefined") {
        group = new InputMorph('NewRel', 'rel');
        operation = new InputMorph('Order Attr', 'attr');
    }
    else {
        inputParams = params.split("|sep|");
        group = new InputMorph(inputParams[0], 'rel');
        operation = new InputMorph(inputParams[1], 'attr');
    }

//    var input_frame = new FrameMorph();
    var relation_label = new StringMorph('Rel:', null, null, true, null, null, null, null, 'white');
    relation_label.setPosition(new Point(this.radius * 2 + this.bwidth + this.gap_width + 4, this.radius - 9));
//    var group = new InputMorph('Group:', 'group');
    group.setPosition(new Point(relation_label.right() + 2, this.radius - 9));
//    group.setPosition(new Point(this.radius*2+this.bwidth+this.gap_width+4, this.radius-9));
    var rename_label = new StringMorph('Attr:', null, null, true, null, null, null, null, 'white');
    rename_label.setPosition(new Point(this.radius * 2 + this.bwidth + this.gap_width + 4, this.radius + 7));
//    var operation = new InputMorph('Out:', 'out');
    operation.setPosition(new Point(rename_label.right() + 2, this.radius + 7));
//    operation.setPosition(new Point(this.radius*2+this.bwidth+this.gap_width+4, this.radius+7));
    this.rect_width = group.width() + 30 + rename_label.width();
    if (operation.width() + 30 > this.rect_width) {
        this.rect_width = operation.width() + 30;
    }
    OperatorRenameMorph.uber.init.call(this);
    this.add(relation_label);
    this.add(rename_label);
    this.add(group);
    this.add(operation);
    var name = new StringMorph(op_name, null, null, true, null, null, null, null, 'white');
    name.setCenter(new Point(this.bwidth + this.radius, this.radius));
    this.add(name);
    this.isTemplate = true;
    this.get_relalg = relalg_operators[query];
    this.get_query = query_operators[query];

	this.wasConnected = false;// Austin S., for determining if Block was connected on last call to .snap()
	this.lastParent = null;// Austin S., for logging the last parent this Block was connected to
	this.isNew = true;// Austin S., for determining if Block came straight from the template, preventing subsequent "moved" logs
};
OperatorRenameMorph.prototype.drawNew = function () {
    console.log(this + ':drawNew');
    this.color = this.fillColor;
    var context;
    this.silentSetExtent(new Point(this.radius * 2 + this.rect_width + this.gap_width + this.bwidth, this.radius * 5));
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    //draw top circle
    drawCircle(context, this.bwidth + this.radius, this.radius, this.radius, this.color);
    //draw middle stem
    drawStem(context, this.bwidth + this.radius, this.radius * 2, this.bwidth + this.radius, this.radius * 4, this.bwidth, this.color);
    //draw bottom arc
    drawTopArc(context, this.bwidth + this.radius, this.radius * 4 - this.bwidth, this.radius, this.bwidth, this.color);
    // draw rectangle
    drawOpRectangle(context, this.bwidth + this.radius, this.radius * 2, this.gap_width, this.conn_height, this.rect_width, this.radius + 10, this.color);
};
OperatorRenameMorph.prototype.attachPoints = function () {
    var points = [], width = 3;
    if (!(this.parent instanceof BaseBlockMorph)) {
        points.push({"element": this, "loc": "top", "point": new Point(this.left() + 25 + width, this.top())});
    }
    if (this.children.filter(function (child) {
            return child instanceof BaseBlockMorph
        }).length === 0) {
        points.push({"element": this, "loc": "bottom", "point": new Point(this.left() + 25 + width, this.top() + 100)});
    }
    return points;
};
OperatorRenameMorph.prototype.snap = function () {

    var target = this.closestAttachTarget(), script = this.parentThatIsA(ScriptMorph), next, offset_y, affected;
    script.clearDropHistory();
    script.lastDroppedBlock = this;

    //Austin S. Reimplemented
	if (target === null)
	{
		if(this.wasConnected)
		{
			update_content(this.operator + "," + this.blockID + "," + "disconnected from" + "," + this.lastParent.operator + "," + this.lastParent.blockID);// Austin S.
			this.wasConnected = false;// Austin S.
			this.lastParent = null;// Austin S.
		}
		else
		{
			if(this.isNew)
			{
				update_content(this.operator + "," + this.blockID + "," + "moved");//Alaura, Austin S: Changed this.data_set.name to this.operator
			}
		}
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
		return;
	}
	else
	{
		update_content(this.operator  +","+ this.blockID + "," + "connected to" + "," + target.element.operator + "," + target.element.blockID);//Alaura, Austin S: Changed target.element.data_set.name to target.element.operator
		this.wasConnected = true;// Austin S.
		this.lastParent = target.element; //Austin S.
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
	}

    clickSound();
    script.lastDropTarget = target;
    this.setTop(target.point.y - (target.source_loc.point.y - this.top()));
    this.setLeft(target.point.x - (target.source_loc.point.x - this.left()));
    if (target.source_loc.loc === 'top') {
        this.blockPosition = target.loc;
        target.element.nextBlocks(this);
    }
    else if (target.source_loc.loc === 'bottom') {
        this.nextBlocks(target.element);
    }
};
OperatorRenameMorph.prototype.fixLayout = function () {
    console.log(this + 'fixLayout');
//    var input = detect(this.children, function(child){return child instanceof InputMorph;});
//    var input_field = detect(input.children, function(child){return child instanceof StringMorph});
    var inputs = this.children.filter(function (child) {
        return child instanceof InputMorph
    });
//    this.rect_width = inputs[0].right();
    this.rect_width = inputs[0].width() + 30 + 24;
    if (inputs[1].width() + 30 > this.rect_width) {
        this.rect_width = inputs[1].width() + 30 + 24;
    }
    this.setExtent(new Point(this.radius * 2 + this.rect_width + this.gap_width + this.bwidth, this.radius * 5));
    var script = this.parentThatIsA(ScriptMorph);
    if (script) {
        script.adjustBounds()
    }
//    this.parentThatIsA(ScriptMorph).adjustBounds();
};
OperatorRenameMorph.prototype.accept = function () {
    var script = this.parentThatIsA(ScriptMorph);
    if (script) {
        script.queryUpdate();
    }
//    this.mouseClickLeft();
};


var OperatorJoinMorph;
OperatorJoinMorph.prototype = new BaseBlockMorph();
OperatorJoinMorph.prototype.constructor = OperatorJoinMorph;
OperatorJoinMorph.uber = BaseBlockMorph.prototype;
function OperatorJoinMorph(name, color, query) {
    this.init(name, color, query)
}
OperatorJoinMorph.prototype.init = function (name, color, query) {
    OperatorJoinMorph.uber.init.call(this);
    this.operator = "NaturalJoin";
    this.fillColor = color || 'CornflowerBlue';//"lightgreen";
    this.get_relalg = relalg_operators[query];
    this.get_query = query_operators[query]; //operatorNaturalJoin;
    this.get_children = children_operators[query];
    var title1 = new StringMorph(name, null, null, true, null, null, null, null, 'white');
    title1.setCenter(new Point(100, 22));
    this.add(title1);
    var title = "Join";
    if (name == 'Cross') {
        title = 'Product'
    }
    var title2 = new StringMorph(title, null, null, true, null, null, null, null, 'white');
    title2.setCenter(new Point(100, 33));
    this.add(title2);
    this.radius = 25;
    this.setExtent(new Point(200, 125));
    this.isTemplate = true;

	this.wasConnected = false;// Austin S., for determining if Block was connected on last call to .snap()
	this.lastParent = null;// Austin S., for logging the last parent this Block was connected to
	this.isNew = true;// Austin S., for determining if Block came straight from the template, preventing subsequent "moved" logs
};
OperatorJoinMorph.prototype.drawNew = function () {
    var context;
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    var width = 3;
    //draw top circle
    drawCircle(context, 100, this.radius, this.radius, this.fillColor);
    //draw left stem
    drawStem(context, 100, this.radius * 2, width + this.radius, this.radius * 4 - width, 3, this.fillColor);
    //draw bottom left arc
    drawTopArc(context, width + this.radius, this.radius * 4 - width, this.radius, width, this.fillColor);
    //draw right stem
    drawStem(context, 100, this.radius * 2, this.radius * 7 - width, this.radius * 4 - width, 3, this.fillColor);
    //draw bottom right arc
    drawTopArc(context, this.radius * 7 - width, this.radius * 4 - width, 25, width, this.fillColor);
};
OperatorJoinMorph.prototype.attachPoints = function () {
    var points = [], width = 3;
    if (!(this.parent instanceof BaseBlockMorph)) {
        points.push({"element": this, "point": new Point(this.left() + 100, this.top()), "loc": "top"});
    }
    if (this.children.filter(function (child) {
            return child instanceof BaseBlockMorph
        }).filter(function (child) {
            return child.blockPosition === 'bottom_left'
        }).length === 0) {
        points.push({
            "element": this,
            "point": new Point(this.left() + 25 + width, this.top() + 100),
            "loc": "bottom_left"
        });
    }
    if (this.children.filter(function (child) {
            return child instanceof BaseBlockMorph
        }).filter(function (child) {
            return child.blockPosition === 'bottom_right'
        }).length === 0) {
        points.push({
            "element": this,
            "point": new Point(this.left() + 175 - width, this.top() + 100),
            "loc": "bottom_right"
        });
    }
    return points;
};
OperatorJoinMorph.prototype.snap = function () {

    var target = this.closestAttachTarget(), script = this.parentThatIsA(ScriptMorph);//, next, offset_y, affected;
    script.clearDropHistory();
    script.lastDroppedBlock = this;

    //Austin S. Reimplemented
    if (target === null)
    {
		if(this.wasConnected)
		{
			if(this.fillColor == "Black")
			{
				update_content("Cross_Product" + "," + this.blockID + "," + "disconnected from" + "," + this.lastParent.operator + "," + this.lastParent.blockID);// Austin S.
			}
			else
			{
				update_content(this.operator + "," + this.blockID + "," + "disconnected from" + "," + this.lastParent.operator + "," + this.lastParent.blockID);// Austin S.
			}
			this.wasConnected = false;// Austin S.
			this.lastParent = null;// Austin S.
		}
		else
		{
			if(this.fillColor == "Black" && this.isNew)
			{
				update_content("Cross_Product"  +","+ this.blockID + "," + "moved");
			}
			else if(this.isNew)
			{
				update_content(this.operator  +","+ this.blockID + "," + "moved");//Alaura, Austin S: Changed this.data_set.name to this.operator
			}
		}
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
        return;
    }
    else
	{
		if(this.fillColor == "Black")
		{
			update_content("Cross_Product"  +","+ this.blockID + "," + "connected to" + "," + target.element.operator + "," + target.element.blockID);//Alaura, Austin S: Changed target.element.data_set.name to target.element.operator
		}
		else
		{
			update_content(this.operator  +","+ this.blockID + "," + "connected to" + "," + target.element.operator + "," + target.element.blockID);//Alaura, Austin S: Changed target.element.data_set.name to target.element.operator
		}
		this.wasConnected = true;// Austin S.
		this.lastParent = target.element; //Austin S.
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
	}

    clickSound();
    script.lastDropTarget = target;
    this.setTop(target.point.y - (target.source_loc.point.y - this.top()));
    this.setLeft(target.point.x - (target.source_loc.point.x - this.left()));
    if (target.source_loc.loc === 'top') {
        this.blockPosition = target.loc;
        target.element.nextBlocks(this);
    }
    else if (target.source_loc.loc === 'bottom_left') {
        target.element.blockPosition = 'bottom_left';
        this.nextBlocks(target.element);
    }
    else if (target.source_loc.loc === 'bottom_right') {
        target.element.blockPosition = 'bottom_right';
        this.nextBlocks(target.element);
    }
//    this.fixLayout();
};


var OperatorUnionMorph;
OperatorUnionMorph.prototype = new BaseBlockMorph();
OperatorUnionMorph.prototype.constructor = OperatorUnionMorph;
OperatorUnionMorph.uber = BaseBlockMorph.prototype;
function OperatorUnionMorph(name, color, query) {
    this.init(name, color, query)
}
OperatorUnionMorph.prototype.init = function (name, color, query) {
    OperatorUnionMorph.uber.init.call(this);
    this.operator = "Union";
    this.fillColor = color || 'DarkOliveGreen';//"lightgreen";
    this.get_relalg = relalg_operators[query];
    this.get_query = query_operators[query];
    this.get_children = children_operators[query];
    var fontsize = 12;
    if (name == 'Difference') {
        fontsize = 10
    }
    if (name == 'Intersection') {
        var title2 = new StringMorph('Inter-', null, null, true, null, null, null, null, 'white');
        title2.setCenter(new Point(100, 16));
        this.add(title2);
        var title3 = new StringMorph('section', null, null, true, null, null, null, null, 'white');
        title3.setCenter(new Point(100, 28));
        this.add(title3);
    }
    else {
        var title1 = new StringMorph(name, fontsize, null, true, null, null, null, null, 'white');
        //    var title1 = new TextMorph(name, null, null, true, null, 'center', null, null, null, null, 'white');
        title1.setCenter(new Point(100, 22));
        this.add(title1);
    }
//    var title2 = new StringMorph("Join", null, null, true, null, null, null, null, 'white');
//    title2.setCenter(new Point(100, 33));
//    this.add(title2);
    this.radius = 25;
    this.setExtent(new Point(200, 125));
    this.isTemplate = true;

    this.wasConnected = false;// Austin S., for determining if Block was connected on last call to .snap()
	this.lastParent = null;// Austin S., for logging the last parent this Block was connected to
	this.isNew = true;// Austin S., for determining if Block came straight from the template, preventing subsequent "moved" logs
};
OperatorUnionMorph.prototype.drawNew = function () {
    var context;
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    var width = 3;
    //draw top circle
    drawCircle(context, 100, this.radius, this.radius, this.fillColor);
    //draw left stem
    drawStem(context, 100, this.radius * 2, width + this.radius, this.radius * 4 - width, 3, this.fillColor);
    //draw bottom left arc
    drawTopArc(context, width + this.radius, this.radius * 4 - width, this.radius, width, this.fillColor);
    //draw right stem
    drawStem(context, 100, this.radius * 2, this.radius * 7 - width, this.radius * 4 - width, 3, this.fillColor);
    //draw bottom right arc
    drawTopArc(context, this.radius * 7 - width, this.radius * 4 - width, 25, width, this.fillColor);
};
OperatorUnionMorph.prototype.attachPoints = function () {
    var points = [], width = 3;
    if (!(this.parent instanceof BaseBlockMorph)) {
        points.push({"element": this, "point": new Point(this.left() + 100, this.top()), "loc": "top"});
    }
    if (this.children.filter(function (child) {
            return child instanceof BaseBlockMorph
        }).filter(function (child) {
            return child.blockPosition === 'bottom_left'
        }).length === 0) {
        points.push({
            "element": this,
            "point": new Point(this.left() + 25 + width, this.top() + 100),
            "loc": "bottom_left"
        });
    }
    if (this.children.filter(function (child) {
            return child instanceof BaseBlockMorph
        }).filter(function (child) {
            return child.blockPosition === 'bottom_right'
        }).length === 0) {
        points.push({
            "element": this,
            "point": new Point(this.left() + 175 - width, this.top() + 100),
            "loc": "bottom_right"
        });
    }
    return points;
};
OperatorUnionMorph.prototype.snap = function () {

    var target = this.closestAttachTarget(), script = this.parentThatIsA(ScriptMorph);//, next, offset_y, affected;
    script.clearDropHistory();
    script.lastDroppedBlock = this;

	//Austin S. Reimplemented
    if (target === null)
    {
    	if(this.wasConnected)
		{
			if(this.fillColor == "LightSeaGreen")
			{
				update_content("Difference" + "," + this.blockID + "," + "disconnected from" + "," + this.lastParent.operator + "," + this.lastParent.blockID);// Austin S.
			}
			else if(this.fillColor == "Chocolate")
			{
				update_content("Intersection" + "," + this.blockID + "," + "disconnected from" + "," + this.lastParent.operator + "," + this.lastParent.blockID);// Austin S.
			}
			else
			{
				update_content(this.operator + "," + this.blockID + "," + "disconnected from" + "," + this.lastParent.operator + "," + this.lastParent.blockID);// Austin S.
			}
		}
		else
		{
			if(this.fillColor == "LightSeaGreen" && this.isNew)
			{
				update_content("Difference"  +","+ this.blockID + "," + "moved");
			}
			else if(this.fillColor == "Chocolate" && this.isNew)
			{
				update_content("Intersection"  +","+ this.blockID + "," + "moved");
			}
			else if(this.isNew)
			{
				update_content(this.operator +","+ this.blockID + "," + "moved");
			}
		}
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
        return;
    }
    else
	{
		if(this.fillColor == "LightSeaGreen")
		{
			update_content("Difference"  +","+ this.blockID + "," + "connected to" + "," + target.element.operator + "," + target.element.blockID)//Alaura, Austin S: Changed target.element.data_set.name to target.element.operator
		}
		else if(this.fillColor == "Chocolate")
		{
			update_content("Intersection"  +","+ this.blockID + "," + "connected to" + "," + target.element.operator + "," + target.element.blockID)//Alaura, Austin S: Changed target.element.data_set.name to target.element.operator
		}
		else
		{
			update_content(this.operator +","+ this.blockID + "," + "connected to" + "," + target.element.operator + "," + target.element.blockID)//Alaura, Austin S: Changed target.element.data_set.name to target.element.operator
		}
		this.wasConnected = true;// Austin S.
		this.lastParent = target.element; //Austin S.
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
	}

    clickSound();
    script.lastDropTarget = target;
    this.setTop(target.point.y - (target.source_loc.point.y - this.top()));
    this.setLeft(target.point.x - (target.source_loc.point.x - this.left()));
    if (target.source_loc.loc === 'top') {
        this.blockPosition = target.loc;
        target.element.nextBlocks(this);
    }
    else if (target.source_loc.loc === 'bottom_left') {
        target.element.blockPosition = 'bottom_left';
        this.nextBlocks(target.element);
    }
    else if (target.source_loc.loc === 'bottom_right') {
        target.element.blockPosition = 'bottom_right';
        this.nextBlocks(target.element);
    }
//    this.fixLayout();
};


var ThetaJoinInputMorph;
ThetaJoinInputMorph.prototype = new Morph();
ThetaJoinInputMorph.prototype.constructor = Morph;
ThetaJoinInputMorph.uber = BaseBlockMorph.prototype;
function ThetaJoinInputMorph() {
    this.init();
}
ThetaJoinInputMorph.prototype.init = function () {
};
ThetaJoinInputMorph.prototype.drawNew = function () {
};


var OperatorThetaJoinMorph;
OperatorThetaJoinMorph.prototype = new BaseBlockMorph();
OperatorThetaJoinMorph.prototype.constructor = OperatorThetaJoinMorph;
OperatorThetaJoinMorph.uber = BaseBlockMorph.prototype;
function OperatorThetaJoinMorph(name, params) {
    this.init(name, params)
}
OperatorThetaJoinMorph.prototype.init = function (name, params) {
//    this.snapPoints = [{"element": this, "point": new Point(this.left()+100, this.top()), "loc": "top"},
//        {"element": this, "point": new Point(this.left()+25+width, this.top()+100), "loc": "bottom_left"},
//        {"element": this, "point": new Point(this.left()+175-width, this.top()+100), "loc": "bottom_right"}];
//    this.title = new StringMorph(name, null, null, true, null, null, null, null, 'white');
    this.operator = "ThetaJoin";
    this.radius = 25;
    this.bwidth = 3;
    this.color = "Maroon";
    this.gap_width = 5;
    this.conn_height = 15;
    var operation;
    if (typeof params === "undefined")
        operation = new InputMorph('Attr Op Attr');
    else
        operation = new InputMorph(params);
    operation.setPosition(new Point(135, 29));
    this.rect_width = operation.width() + 30;
    OperatorJoinMorph.uber.init.call(this);
    this.add(operation);
    this.fillColor = 'Maroon';//"lightgreen";
    this.get_relalg = relalg_operators['ThetaJoin'];
    this.get_query = query_operators['ThetaJoin'];
    var title1 = new StringMorph("Theta", null, null, true, null, null, null, null, 'white');
    title1.setCenter(new Point(100, 22));
    this.add(title1);
    var title2 = new StringMorph("Join", null, null, true, null, null, null, null, 'white');
    title2.setCenter(new Point(100, 33));
    this.add(title2);
    this.radius = 25;
    this.isTemplate = true;
    this.drawNew();

	this.wasConnected = false;// Austin S., for determining if Block was connected on last call to .snap()
	this.lastParent = null;// Austin S., for logging the last parent this Block was connected to
	this.isNew = true;// Austin S., for determining if Block came straight from the template, preventing subsequent "moved" logs
};
OperatorThetaJoinMorph.prototype.drawNew = function () {
    var context;
    this.color = "Maroon";
    this.silentSetExtent(new Point(125 + this.rect_width + this.gap_width + this.bwidth, this.radius * 5));
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    var width = 3;
    //draw top circle
    drawCircle(context, 100, this.radius, this.radius, this.fillColor);
    //draw side operator rectangle
    drawOpRectangle(context, 100, this.radius * 2, this.gap_width - 71, this.conn_height, this.rect_width + 71, this.radius, this.fillColor);
    //draw left stem
    drawStem(context, 100, this.radius * 2, width + this.radius, this.radius * 4 - width, 3, this.fillColor);
    //draw bottom left arc
    drawTopArc(context, width + this.radius, this.radius * 4 - width, this.radius, width, this.fillColor);
    //draw right stem
    drawStem(context, 100, this.radius * 2, this.radius * 7 - width, this.radius * 4 - width, 3, this.fillColor);
    //draw bottom right arc
    drawTopArc(context, this.radius * 7 - width, this.radius * 4 - width, 25, width, this.fillColor);
//    this.fixLayout();
};
OperatorThetaJoinMorph.prototype.attachPoints = function () {
    var points = [], width = 3;
    if (!(this.parent instanceof BaseBlockMorph)) {
        points.push({"element": this, "point": new Point(this.left() + 100, this.top()), "loc": "top"});
    }
    if (this.children.filter(function (child) {
            return child instanceof BaseBlockMorph
        }).filter(function (child) {
            return child.blockPosition === 'bottom_left'
        }).length === 0) {
        points.push({
            "element": this,
            "point": new Point(this.left() + 25 + width, this.top() + 100),
            "loc": "bottom_left"
        });
    }
    if (this.children.filter(function (child) {
            return child instanceof BaseBlockMorph
        }).filter(function (child) {
            return child.blockPosition === 'bottom_right'
        }).length === 0) {
        points.push({
            "element": this,
            "point": new Point(this.left() + 175 - width, this.top() + 100),
            "loc": "bottom_right"
        });
    }
    return points;
};
//OperatorThetaJoinMorph.prototype.snap = function(){
//    var target = this.closestAttachTarget(), script = this.parentThatIsA(ScriptMorph);//, next, offset_y, affected;
//    script.clearDropHistory();
//    script.lastDroppedBlock = this;
//    if (target === null){
//        return;}
//    clickSound();
//    script.lastDropTarget = target;
//    this.setTop(target.point.y-(target.source_loc.point.y-this.top()));
//    this.setLeft(target.point.x-(target.source_loc.point.x-this.left()));
//    if (target.source_loc.loc === 'top'){
//        this.blockPosition = target.loc;
//        target.element.nextBlocks(this);}
//    else if (target.source_loc.loc === 'bottom_left'){
//        target.element.blockPosition = 'bottom_left';
//        this.nextBlocks(target.element);}
//    else if (target.source_loc.loc === 'bottom_right'){
//        target.element.blockPosition = 'bottom_right';
//        this.nextBlocks(target.element);}
////    this.fixLayout();
//};
//OperatorThetaJoinMorph.prototype.fixLayout = function(){
////    this.title.setCenter(new Point(100, 25));
//    var input = detect(this.children, function(child){return child instanceof InputMorph;});
//    this.rect_width = input.width()+30;
//    this.setExtent(new Point(125+this.rect_width+this.gap_width+this.bwidth, this.radius*5));
//    var sandbox = this.parentThatIsA(ScriptMorph);
//    if(sandbox){sandbox.adjustBounds()}
////    this.parentThatIsA(ScriptMorph).setRight(50);
//};
OperatorThetaJoinMorph.prototype.accept = function () {
    var script = this.parentThatIsA(ScriptMorph);
    if (script) {
        script.queryUpdate();
    }
//    this.mouseClickLeft();
};
OperatorThetaJoinMorph.prototype.ctrl = function (aChar) {
    alert(aChar)
};
OperatorThetaJoinMorph.prototype.snap = function () {

    var target = this.closestAttachTarget(), script = this.parentThatIsA(ScriptMorph);//, next, offset_y, affected;
    script.clearDropHistory();
    script.lastDroppedBlock = this;

	//Austin S. Reimplemented
	if (target === null)
	{
		if(this.wasConnected)
		{
			update_content(this.operator + "," + this.blockID + "," + "disconnected from" + "," + this.lastParent.operator + "," + this.lastParent.blockID);// Austin S.
			this.wasConnected = false;// Austin S.
			this.lastParent = null;// Austin S.
		}
		else
		{
			if(this.isNew)
			{
				update_content(this.operator + "," + this.blockID + "," + "moved");//Alaura, Austin S: Changed this.data_set.name to this.operator
			}
		}
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
		return;
	}
	else
	{
		update_content(this.operator  +","+ this.blockID + "," + "connected to" + "," + target.element.operator + "," + target.element.blockID);//Alaura, Austin S: Changed target.element.data_set.name to target.element.operator
		this.wasConnected = true;// Austin S.
		this.lastParent = target.element; //Austin S.
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
	}

	clickSound();
    script.lastDropTarget = target;
    this.setTop(target.point.y - (target.source_loc.point.y - this.top()));
    this.setLeft(target.point.x - (target.source_loc.point.x - this.left()));
    if (target.source_loc.loc === 'top') {
        this.blockPosition = target.loc;
        target.element.nextBlocks(this);
    }
    else if (target.source_loc.loc === 'bottom_left') {
        target.element.blockPosition = 'bottom_left';
        this.nextBlocks(target.element);
    }
    else if (target.source_loc.loc === 'bottom_right') {
        target.element.blockPosition = 'bottom_right';
        this.nextBlocks(target.element);
    }
//    this.fixLayout();
};


var DataSetBlockMorph;
DataSetBlockMorph.prototype = new BaseBlockMorph();
DataSetBlockMorph.prototype.constructor = DataSetBlockMorph;
DataSetBlockMorph.uber = BaseBlockMorph.prototype;
function DataSetBlockMorph(data, name, queryParent) {
    this.init(data, name, queryParent)
}
DataSetBlockMorph.prototype.init = function (data, name, queryParent) {
    DataSetBlockMorph.uber.init.call(this);
    this.isTemplate = true;
    this.radius = 25;
    this.isView = false;
    this.setExtent(new Point(200, 100));

    if ((name) && (queryParent)) {
        this.color = 'darkorange';
        this.operator = "View";
        this.queryParent = queryParent;
        this.viewquery = queryParent.get_relalg();
        this.viewName = name;
        this.isView = true;
        data = queryParent.get_query();
        data['name'] = name;
    } else {
        this.color = 'orange';
        this.operator = "DataSet";
        this.data_set = data;
    }

    this.drawNew();


    if ((name) && (queryParent)) {
        this.title = new StringMorph("View", null, null, true, null, null, null, null, 'white');
    } else {
        this.title = new StringMorph("Table", null, null, true, null, null, null, null, 'white');
    }

    this.title.setCenter(new Point(this.radius, this.radius));
    this.add(this.title);
    var block_name = new StringMorph(data['name'], null, null, true, null, null, null, null, 'white');
//    var block_name = new StringMorph(resource.replace('V2', ''), null, null, true, null, null, null, null, 'white');
    block_name.setCenter(new Point(105, 35));
    if (this.isView) {
        this.data_set = null;
    }
    this.add(block_name);

	this.wasConnected = false;// Austin S., for determining if Block was connected on last call to .snap()
	this.lastParent = null;// Austin S., for logging the last parent this Block was connected to
    this.isNew = true;// Austin S., for determining if Block came straight from the template, preventing subsequent "moved" logs
};
DataSetBlockMorph.prototype.drawNew = function () {
    var context;
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
//    var color = "orange";
    //draw top circle
    drawCircle(context, this.radius, this.radius, this.radius, this.color);
    //draw side rectangle
    drawOpRectangle(context, this.radius, 2 * this.radius, 10, 15, 110, 30, this.color);
};
DataSetBlockMorph.prototype.attachPoints = function () {
    console.log(this + ':attachPoints');
    var points = [];
    if (!(this.parent instanceof BaseBlockMorph)) {
        points.push({"element": this, "point": new Point(this.left() + 25, this.top()), "loc": "top"});
    }

    return points;
};
DataSetBlockMorph.prototype.snap = function () {
    //console.log(this + ':snap');

    var target = this.closestAttachTarget(), script = this.parentThatIsA(ScriptMorph), next, offset_y, affected;
    script.clearDropHistory();
    script.lastDroppedBlock = this;
    //Austin S. Reimplemented
	if (target === null)
	{
		if(this.wasConnected)
		{
			update_content(this.operator + "," + this.blockID + "," + "disconnected from" + "," + this.lastParent.operator + "," + this.lastParent.blockID);// Austin S.
			this.wasConnected = false;// Austin S.
			this.lastParent = null;// Austin S.
		}
		else
		{
		    if(this.isNew)
            {
				update_content(this.operator + "," + this.blockID + "," + "moved");//Alaura, Austin S: Changed this.data_set.name to this.operator
            }
		}
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
		return;
	}
	else
	{
		update_content(this.operator  +","+ this.blockID + "," + "connected to" + "," + target.element.operator + "," + target.element.blockID);//Alaura, Austin S: Changed target.element.data_set.name to target.element.operator
		this.wasConnected = true;// Austin S.
		this.lastParent = target.element; //Austin S.
		this.isNew = false;// Austin S., prevents the next calls to .snap() from producing "moved" logs after the block initially moved from the template
	}

	clickSound();
    console.log(this + ':snap:closestTarget=' + target);
    script.lastDropTarget = target;
    if (target.source_loc.loc === 'top') {
//        clickSound();
        this.blockPosition = target.loc;
        this.setTop(target.point.y);
        this.setLeft(target.point.x - 25);
        target.element.nextBlocks(this);
    }
};

DataSetBlockMorph.prototype.get_relalg = function (viewIsChildren) {
    if (this.isView) {
        this.data_set = this.queryParent.get_query();
        if (viewIsChildren) {
            this.data_set = null;
            return {'relalg': this.viewName};
        } else {
            this.data_set = null;
            return {'relalg': this.viewName + ': ' + this.viewquery['relalg']};
        }
        this.data_set = null;
    }
    return {'relalg': this.data_set['name']};
};
DataSetBlockMorph.prototype.get_query = function () {
    var copy = [];
    if (this.isView) {
        this.data_set = this.queryParent.get_query();

    }
    if (this.isView) {
        var data = this.data_set;
        this.data_set = null;
        data['data'].forEach(function (entry) {
            copy.push($.extend({}, entry))
        });
        return {
            "table_name": "table_data",
            "data": copy,
            'name': this.viewName,
            'attributes': data['attributes']
        };

    } else {
        this.data_set['data'].forEach(function (entry) {
            copy.push($.extend({}, entry))
        });
        return {
            "table_name": "table_data",
            "data": copy,
            'name': this.data_set['name'],
            'attributes': this.data_set['attributes']
        };
    }

};

// Austin S.
// Update Content feature reimplemented 9/4/2018

var csv_data = [];
//var time = (new Date()).toLocaleDateString();//Alaura
function update_content (row_text){//Alaura


// update csv with new row
    var new_row = Date() +","+ row_text;
    csv_data.push(new_row);


}
function download_csv(){
    var downloadlink;
    var prepared_csv = csv_data.join("\r\n");
    var csvfile = new Blob([prepared_csv], {type:"text/csv"});
    downloadlink = document.createElement('a');
    downloadlink.download = "dbSnapData.csv";
    downloadlink.href = window.URL.createObjectURL(csvfile);
    downloadlink.style.display = 'none';
    document.body.appendChild(downloadlink);
    downloadlink.click();
}


//start here

/*var ViewDataSetBlockMorph;
 ViewDataSetBlockMorph.prototype = new BaseBlockMorph();
 ViewDataSetBlockMorph.prototype.constructor = DataSetBlockMorph;
 ViewDataSetBlockMorph.uber = BaseBlockMorph.prototype;
 function ViewDataSetBlockMorph(data, name, query, children){this.init(data, name, query, children)}
 ViewDataSetBlockMorph.prototype.init = function(data, name, query, data_children){
 DataSetBlockMorph.uber.init.call(this);
 this.color = 'darkorange';
 this.drawNew();
 this.operator = "View"; //View
 this.isTemplate = true;
 this.radius = 25;
 this.setExtent(new Point(200, 100));
 data['name'] = name;
 this.data_set = data;
 this.data_children = data_children;
 this.query = query;
 this.title = new StringMorph("View", null, null, true, null, null, null, null, 'white');
 this.title.setCenter(new Point(this.radius, this.radius));
 this.add(this.title);
 var block_name = new StringMorph(data['name'], null, null, true, null, null, null, null, 'white');
 //    var block_name = new StringMorph(resource.replace('V2', ''), null, null, true, null, null, null, null, 'white');
 block_name.setCenter(new Point(105, 35));
 this.add(block_name);
 };
 ViewDataSetBlockMorph.prototype.drawNew = function(){
 var context;
 this.image = newCanvas(this.extent());
 context = this.image.getContext('2d');
 //    var color = "orange";
 //draw top circle
 drawCircle(context, this.radius, this.radius, this.radius, this.color);
 //draw side rectangle
 drawOpRectangle(context, this.radius, 2*this.radius, 10, 15, 110, 30, this.color);
 };
 ViewDataSetBlockMorph.prototype.attachPoints = function(){
 console.log(this+':attachPoints');
 var points = [];
 if(!(this.parent instanceof BaseBlockMorph)){
 points.push({"element": this, "point": new Point(this.left()+25, this.top()), "loc": "top"});}

 return points;
 };
 ViewDataSetBlockMorph.prototype.snap = function(){
 console.log(this+':snap');

 var target = this.closestAttachTarget(), script = this.parentThatIsA(ScriptMorph), next, offset_y, affected;
 script.clearDropHistory();
 script.lastDroppedBlock = this;
 if (target === null){
 return;}
 clickSound();
 console.log(this+':snap:closestTarget='+target);
 script.lastDropTarget = target;
 if(target.source_loc.loc === 'top'){
 //        clickSound();
 this.blockPosition = target.loc;
 this.setTop(target.point.y);
 this.setLeft(target.point.x-25);
 target.element.nextBlocks(this);}};

 ViewDataSetBlockMorph.prototype.get_relalg = function(){
 return {'relalg': this.query['relalg']};
 };
 ViewDataSetBlockMorph.prototype.get_query = function(){
 var copy = [];
 this.data_set['data'].forEach(function(entry){copy.push($.extend({}, entry))});
 return {"table_name": "table_data", "data": copy, 'name': this.data_set['name'], 'attributes': this.data_set['attributes']};
 };

 //end here*/

var InputMorph;
InputMorph.prototype = new Morph();
InputMorph.prototype.constructor = InputMorph;
InputMorph.uber = Morph.prototype;
function InputMorph(text, label) {
    this.init(text, label)
}
InputMorph.prototype.init = function (text, label) {
    this.edge = 1.000001;
    this.default = true;
    InputMorph.uber.init.call(this);
    this.label = label || null;
    var arrow = new ArrowMorph('down');
    arrow.setSize(0);
    this.add(arrow);
    var contents = new StringMorph('', null, null, null, true);
    contents.isEditable = true;
    contents.enableSelecting();
    this.add(contents);
    contents.drawNew();
    this.setFieldContent(text);
};
InputMorph.prototype.drawNew = function () {
    this.image = newCanvas(this.extent());
    var context = this.image.getContext('2d');
//    context.fillStyle = 'green';
//    context.fillRect(0,0,this.width(),this.height());
    context.fillStyle = 'white';
    var r = (this.height() - (this.edge * 2)) / 2;
    context.beginPath();
    context.arc(r + this.edge, r + this.edge, r, radians(90), radians(-90), false);
    context.arc(this.width() - r - this.edge, r + this.edge, r, radians(-90), radians(90), false);
    context.closePath();
    context.fill();
    this.drawRoundBorder(context);
};
InputMorph.prototype.mouseClickLeft = function (pos) {
    console.log(this + ':mouseClickLeft');
//    if(this.arrow().bounds.containsPoint(pos)){
//        this.dropDownMenu();
//    }else {
    var text = this.getText();
    text.edit();
    text.selectAll();
//    }
};
InputMorph.prototype.arrow = function () {
    return detect(this.children, function (child) {
        return child instanceof ArrowMorph
    });
};
InputMorph.prototype.getText = function () {
    return detect(this.children, function (child) {
        return child instanceof StringMorph
    });
};
InputMorph.prototype.setFieldContent = function (item) {
    var text = this.getText();
    text.text = item;
    text.drawNew();
};
InputMorph.prototype.reactToEdit = function () {
    this.getText().clearSelection()
};
InputMorph.prototype.reactToKeystroke = function () {
    if (this.default) {
        var text = this.getText();
        this.default = null;
        text.isItalic = false;
        text.drawNew();
    }
};
InputMorph.prototype.drawRoundBorder = function (context) {

    var shift = this.edge * 0.5, r = (this.height() - (this.edge * 2)) / 2, start, end, gradient;

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    // straight top edge:
    start = r + this.edge;
    end = this.width() - r - this.edge;
    if (end > start) {

        context.shadowOffsetX = shift;
        context.shadowOffsetY = shift;
        context.shadowBlur = this.edge;
        context.shadowColor = this.color.darker(80).toString();

        this.cachedClr = 'green';
        this.cachedClrBright = 'lightgreen';
        this.cachedClrDark = 'darkgreen';
        gradient = context.createLinearGradient(0, 0, 0, this.edge);
        gradient.addColorStop(0, this.cachedClr);
        gradient.addColorStop(1, this.cachedClrDark);
        context.strokeStyle = gradient;
        context.beginPath();

        context.moveTo(start, shift);
        context.lineTo(end, shift);
        context.stroke();

        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
    }

    // straight bottom edge:
    gradient = context.createLinearGradient(0, this.height() - this.edge, 0, this.height());
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r + this.edge, this.height() - shift);
    context.lineTo(this.width() - r - this.edge, this.height() - shift);
    context.stroke();

    r = this.height() / 2;

    context.shadowOffsetX = shift;
    context.shadowOffsetY = shift;
    context.shadowBlur = this.edge;
    context.shadowColor = this.color.darker(80).toString();

    // top edge: left corner
    gradient = context.createRadialGradient(r, r, r - this.edge, r, r, r);
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(r, r, r - shift, radians(180), radians(270), false);

    context.stroke();

    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;

    // bottom edge: right corner
    gradient = context.createRadialGradient(this.width() - r, r, r - this.edge, this.width() - r, r, r);
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(this.width() - r, r, r - shift, radians(0), radians(90), false);
    context.stroke();
};
InputMorph.prototype.fixLayout = function () {
    console.log(this + ':fixLayout');
    var input_field = this.getText(), arrow = this.arrow(), arrow_width = 12;
    if (arrow) {
        arrow_width = arrow.width();
    }
    this.setHeight(input_field.height() + this.edge * 2);
    this.typeInPadding = 4;
    this.minWidth = 5;
    this.setWidth(Math.max(input_field.width() + arrow.width() + this.edge * 2 + this.typeInPadding * 2,
        input_field.rawHeight ? // single vs. multi-line contents
        input_field.rawHeight() + arrow.width()
            : input_field.height() / 1.2 + arrow.width(),
        this.minWidth // for text-type slots
    ));
    input_field.setPosition(new Point(
        this.edge,
        this.edge
    ).add(new Point(this.typeInPadding, 0)).add(this.position()));
//    if(arrow){
//        arrow.setPosition(new Point(50, this.top()));
    arrow.setPosition(new Point(this.right() - arrow_width - this.edge, this.top()));
//    }
//    input_field.setPosition(new Point(2, 1));
//    contents.setPosition(new Point(
//            this.edge,
//            this.edge
//        ).add(new Point(this.typeInPadding, 0)).add(this.position()));
    if (this.parent) {
        if (this.parent.fixLayout) {
//            if (this.world()) {
//                console.log('world:wrongpath')
////                this.startLayout();
////                this.parent.fixLayout();
////                this.endLayout();
//            } else {
            this.parent.fixLayout();
//            }
        }
    }
};
InputMorph.prototype.dropDownMenu = function () {
    var menu = new MenuMorph(this.setFieldContent, null, this);
    menu.addItem('<', '<');
    menu.addItem('<=', '<=');
    menu.addItem('=', '=');
    menu.addItem('<>', '<>');
    menu.addItem('=>', '=>');
    menu.addItem('>', '>');
    menu.popUpCenteredAtHand(this.world());
};


var InputReporterMorph;
InputReporterMorph.prototype = new BaseBlockMorph();
InputReporterMorph.prototype.constructor = InputReporterMorph;
InputReporterMorph.uber = BaseBlockMorph.prototype;
function InputReporterMorph(isPredicate) {
    this.init(isPredicate);
    this.isTemplate = true;
}
InputReporterMorph.prototype.init = function (isPredicate) {
    InputReporterMorph.uber.init.call(this);
    this.isPredicate = isPredicate || false;
    this.setExtent(new Point(200, 80));
};
InputReporterMorph.prototype.snap = function (hand) {
    // passing the hand is optional (for when blocks are dragged & dropped)
    var scripts = this.parent,
        target;

    if (!scripts instanceof ScriptsMorph) {
        return null;
    }

    scripts.clearDropHistory();
    scripts.lastDroppedBlock = this;

    target = scripts.closestInput(this, hand);
    if (target !== null) {
        scripts.lastReplacedInput = target;
        scripts.lastDropTarget = target.parent;
        if (target instanceof MultiArgMorph) {
            scripts.lastPreservedBlocks = target.inputs();
            scripts.lastReplacedInput = target.fullCopy();
        }
        target.parent.replaceInput(target, this);
        if (this.snapSound) {
            this.snapSound.play();
        }
    }
    this.startLayout();
    this.fixBlockColor();
    this.endLayout();
    InputReporterMorph.uber.snap.call(this);
};
InputReporterMorph.prototype.prepareToBeGrabbed = function (handMorph) {
    var oldPos = this.position();

    nop(handMorph);
    if ((this.parent instanceof BaseBlockMorph)) {
        this.parent.revertToDefaultInput(this);
        this.setPosition(oldPos);
    }
//    InputReporterMorph.uber.prepareToBeGrabbed.call(this, handMorph);
};
InputReporterMorph.prototype.blockSequence = function () {
    // reporters don't have a sequence, answer myself
    return this;
};
InputReporterMorph.prototype.isUnevaluated = function () {
    /*
     answer whether my parent block's slot is designated to be of an
     'unevaluated' kind, denoting a spedial form
     */
    return contains(['%anyUE', '%boolUE', '%f'], this.getSlotSpec());
};
InputReporterMorph.prototype.isLocked = function () {
    // answer true if I can be exchanged by a dropped reporter
    return this.isStatic || (this.getSlotSpec() === '%t');
};
InputReporterMorph.prototype.getSlotSpec = function () {
    // answer the spec of the slot I'm in, if any
    var parts, idx;
    if (this.parent instanceof BlockMorph) {
        parts = this.parent.parts().filter(
            function (part) {
                return !(part instanceof BlockHighlightMorph);
            }
        );
        idx = parts.indexOf(this);
        if (idx !== -1) {
            if (this.parent.blockSpec) {
                return this.parseSpec(this.parent.blockSpec)[idx];
            }
        }
    }
    if (this.parent instanceof MultiArgMorph) {
        return this.parent.slotSpec;
    }
    if (this.parent instanceof TemplateSlotMorph) {
        return this.parent.getSpec();
    }
    return null;
};
InputReporterMorph.prototype.mouseClickLeft = function (pos) {
    var isRing;
//    if (this.parent instanceof BlockInputFragmentMorph) {
//        return this.parent.mouseClickLeft();
//    }
//    if (this.parent instanceof TemplateSlotMorph) {
//        isRing = this.parent.parent && this.parent.parent.parent &&
//            this.parent.parent.parent instanceof RingMorph;
//        new DialogBoxMorph(
//            this,
//            this.setSpec,
//            this
//        ).prompt(
//            isRing ? "Input name" : "Script variable name",
//            this.blockSpec,
//            this.world()
//        );
//    } else {
//        InputReporterMorph.uber.mouseClickLeft.call(this, pos);
//    }
};
InputReporterMorph.prototype.userDestroy = function () {
    // make sure to restore default slot of parent block
    this.prepareToBeGrabbed(this.world().hand);
    this.destroy();
};
InputReporterMorph.prototype.drawNew = function () {
    var context;
    this.cachedClr = 'blue';
    this.cachedClrBright = 'lightblue';
    this.cachedClrDark = 'darkblue';
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    context.fillStyle = this.cachedClr;
    this.drawRounded(context);
    // erase CommandSlots
//    this.eraseHoles(context);
};
InputReporterMorph.prototype.drawRounded = function (context) {
    this.edge = 1;
    this.rounding = 10;
    var h = this.height(), r = Math.min(this.rounding, h / 2), w = this.width(), shift = this.edge / 2, gradient;
    // draw the 'flat' shape:
    context.fillStyle = this.cachedClr;
    context.beginPath();
    // top left:
    context.arc(r, r, r, radians(-180), radians(-90), false);
    // top right:
    context.arc(w - r, r, r, radians(-90), radians(-0), false);
    // bottom right:
    context.arc(w - r, h - r, r, radians(0), radians(90), false);
    // bottom left:
    context.arc(r, h - r, r, radians(90), radians(180), false);
    context.closePath();
    context.fill();

    if (MorphicPreferences.isFlat) {
        return;
    }
    // add 3D-Effect:
    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    // half-tone edges
    // bottem left corner
    gradient = context.createRadialGradient(r, h - r, r - this.edge, r, h - r, r + this.edge);
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(r, h - r, r - shift, radians(90), radians(180), false);
    context.stroke();
    // top right corner
    gradient = context.createRadialGradient(w - r, r, r - this.edge, w - r, r, r + this.edge);
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(w - r, r, r - shift, radians(-90), radians(0), false);
    context.stroke();
    // normal gradient edges

    // top edge: straight line
    gradient = context.createLinearGradient(0, 0, 0, this.edge);
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r - shift, shift);
    context.lineTo(w - r + shift, shift);
    context.stroke();

    // top edge: left corner
    gradient = context.createRadialGradient(r, r, r - this.edge, r, r, r);
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(r, r, r - shift, radians(180), radians(270), false);
    context.stroke();

    // bottom edge: right corner
    gradient = context.createRadialGradient(w - r, h - r, r - this.edge, w - r, h - r, r);
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(w - r, h - r, r - shift, radians(0), radians(90), false);
    context.stroke();

    // bottom edge: straight line
    gradient = context.createLinearGradient(0, h - this.edge, 0, h);
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r - shift, h - shift);
    context.lineTo(w - r + shift, h - shift);
    context.stroke();

    // left edge: straight vertical line
    gradient = context.createLinearGradient(0, 0, this.edge, 0);
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(shift, r);
    context.lineTo(shift, h - r);
    context.stroke();

    // right edge: straight vertical line
    gradient = context.createLinearGradient(w - this.edge, 0, w, 0);
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(w - shift, r + shift);
    context.lineTo(w - shift, h - r);
    context.stroke();

};

var SettingsButtonMorph;
SettingsButtonMorph.prototype = new Morph();
SettingsButtonMorph.prototype.constructor = SettingsButtonMorph;
SettingsButtonMorph.uber = Morph.prototype;
function SettingsButtonMorph() {
    this.init()
}
SettingsButtonMorph.prototype.init = function () {
    SettingsButtonMorph.uber.init.call(this);
};
SettingsButtonMorph.prototype.drawNew = function () {
    var context;
    this.image = newCanvas(new Point(20, 20));
    context = this.image.getContext('2d');
    drawCircle(context, 10, 10, 10, 'green');
};
SettingsButtonMorph.prototype.mouseClickLeft = function () {
    var menu = new MenuMorph();
    menu.addItem('Import Table');
    menu.addItem('Dynamic Query Update');
    menu.popUpAtHand(this.world());
};

var PushButtonMorph;
// PushButtonMorph /////////////////////////////////////////////////////

// I am a Button with rounded corners and 3D-ish graphical effects

// PushButtonMorph inherits from TriggerMorph:

PushButtonMorph.prototype = new TriggerMorph();
PushButtonMorph.prototype.constructor = PushButtonMorph;
PushButtonMorph.uber = TriggerMorph.prototype;

// PushButtonMorph preferences settings:

PushButtonMorph.prototype.fontSize = 10;
PushButtonMorph.prototype.fontStyle = 'sans-serif';
PushButtonMorph.prototype.labelColor = new Color(0, 0, 0);
PushButtonMorph.prototype.labelShadowColor = new Color(255, 255, 255);
PushButtonMorph.prototype.labelShadowOffset = new Point(1, 1);

PushButtonMorph.prototype.color = new Color(255, 255, 255);
PushButtonMorph.prototype.pressColor = new Color(115, 180, 240);
PushButtonMorph.prototype.highlightColor
    = PushButtonMorph.prototype.pressColor.lighter(50);
PushButtonMorph.prototype.outlineColor = new Color(0, 0, 0);
PushButtonMorph.prototype.outlineGradient = false;
PushButtonMorph.prototype.contrast = 60;

PushButtonMorph.prototype.edge = 2;
PushButtonMorph.prototype.corner = 5;
PushButtonMorph.prototype.outline = 1.00001;
PushButtonMorph.prototype.padding = 3;

// PushButtonMorph instance creation:

function PushButtonMorph(target,
                         action,
                         labelString,
                         environment,
                         hint,
                         template) {
    this.init(
        target,
        action,
        labelString,
        environment,
        hint,
        template
    );
}

PushButtonMorph.prototype.init = function (target,
                                           action,
                                           labelString,
                                           environment,
                                           hint,
                                           template) {
    // additional properties:
    this.is3D = false; // for "flat" design exceptions
    this.target = target || null;
    this.action = action || null;
    this.environment = environment || null;
    this.labelString = labelString || null;
    this.label = null;
    this.labelMinExtent = new Point(0, 0);
    this.hint = hint || null;
    this.template = template || null; // for pre-computed backbrounds
    // if a template is specified, its background images are used as cache

    // initialize inherited properties:
    TriggerMorph.uber.init.call(this);

    // override inherited properites:
    this.color = PushButtonMorph.prototype.color;
    this.drawNew();
    this.fixLayout();
};

// PushButtonMorph layout:

PushButtonMorph.prototype.fixLayout = function () {
    // make sure I at least encompass my label
    if (this.label !== null) {
        var padding = this.padding * 2 + this.outline * 2 + this.edge * 2;
        this.setExtent(new Point(
            Math.max(this.label.width(), this.labelMinExtent.x) + padding,
            Math.max(this.label instanceof StringMorph ?
                this.label.rawHeight() :
                this.label.height(), this.labelMinExtent.y) + padding
        ));
        this.label.setCenter(this.center());
    }
};

// PushButtonMorph events

PushButtonMorph.prototype.mouseDownLeft = function () {
    PushButtonMorph.uber.mouseDownLeft.call(this);
    if (this.label) {
        this.label.setCenter(this.center().add(1));
    }
};

PushButtonMorph.prototype.mouseClickLeft = function () {
    PushButtonMorph.uber.mouseClickLeft.call(this);
    if (this.label) {
        this.label.setCenter(this.center());
    }
};

PushButtonMorph.prototype.mouseLeave = function () {
    PushButtonMorph.uber.mouseLeave.call(this);
    if (this.label) {
        this.label.setCenter(this.center());
    }
};

// PushButtonMorph drawing:

PushButtonMorph.prototype.outlinePath = BoxMorph.prototype.outlinePath;

PushButtonMorph.prototype.drawBackground = function (context, color) {
    var isFlat = MorphicPreferences.isFlat && !this.is3D;

    context.fillStyle = color.toString();
    context.beginPath();
    this.outlinePath(
        context,
        isFlat ? 0 : Math.max(this.corner - this.outline, 0),
        this.outline
    );
    context.closePath();
    context.fill();
    context.lineWidth = this.outline;
};

PushButtonMorph.prototype.createBackgrounds = function () {
    var context,
        ext = this.extent();

    if (this.template) { // take the backgrounds images from the template
        this.image = this.template.image;
        this.normalImage = this.template.normalImage;
        this.highlightImage = this.template.highlightImage;
        this.pressImage = this.template.pressImage;
        return null;
    }

    this.normalImage = newCanvas(ext);
    context = this.normalImage.getContext('2d');
    this.drawBackground(context, this.color);

    this.highlightImage = newCanvas(ext);
    context = this.highlightImage.getContext('2d');
    this.drawBackground(context, this.highlightColor);

    this.pressImage = newCanvas(ext);
    context = this.pressImage.getContext('2d');
    this.drawBackground(context, this.pressColor);

    this.image = this.normalImage;
};

PushButtonMorph.prototype.createLabel = function () {
    var shading = !MorphicPreferences.isFlat || this.is3D;

    if (this.label !== null) {
        this.label.destroy();
    }
    if (this.labelString instanceof SymbolMorph) {
        this.label = this.labelString.fullCopy();
        if (shading) {
            this.label.shadowOffset = this.labelShadowOffset;
            this.label.shadowColor = this.labelShadowColor;
        }
        this.label.color = this.labelColor;
        this.label.drawNew();
    } else {
        this.label = new StringMorph(
            localize(this.labelString),
            this.fontSize,
            this.fontStyle,
            true,
            false,
            false,
            shading ? this.labelShadowOffset : null,
            this.labelShadowColor,
            this.labelColor
        );
    }
    this.add(this.label);
};

var SymbolMorph;
// SymbolMorph //////////////////////////////////////////////////////////

/*
 I display graphical symbols, such as special letters. I have been
 called into existence out of frustration about not being able to
 consistently use Unicode characters to the same ends.

 Symbols can also display costumes, if one is specified in lieu
 of a name property, although this feature is currently not being
 used because of asynchronous image loading issues.
 */

// SymbolMorph inherits from Morph:

SymbolMorph.prototype = new Morph();
SymbolMorph.prototype.constructor = SymbolMorph;
SymbolMorph.uber = Morph.prototype;

// SymbolMorph available symbols:

SymbolMorph.prototype.names = [
    'save',
    'directory',
    'view'
];

// SymbolMorph instance creation:

function SymbolMorph(name, size, color, shadowOffset, shadowColor) {
    this.init(name, size, color, shadowOffset, shadowColor);
}

SymbolMorph.prototype.init = function (name,
                                       size,
                                       color,
                                       shadowOffset,
                                       shadowColor) {
    this.isProtectedLabel = false; // participate in zebraing
    this.isReadOnly = true;
    this.name = name || 'view';
    this.size = size || ((size === 0) ? 0 : 50);
    this.shadowOffset = shadowOffset || new Point(0, 0);
    this.shadowColor = shadowColor || null;

    SymbolMorph.uber.init.call(this);
    this.color = color || new Color(0, 0, 0);
    this.drawNew();
};

// SymbolMorph zebra coloring:

SymbolMorph.prototype.setLabelColor = function (textColor,
                                                shadowColor,
                                                shadowOffset) {
    this.shadowOffset = shadowOffset;
    this.shadowColor = shadowColor;
    this.setColor(textColor);
};

// SymbolMorph displaying:

SymbolMorph.prototype.drawNew = function () {
    var ctx, x, y, sx, sy;
    this.image = newCanvas(new Point(
        this.symbolWidth() + Math.abs(this.shadowOffset.x),
        this.size + Math.abs(this.shadowOffset.y)
    ));
    this.silentSetWidth(this.image.width);
    this.silentSetHeight(this.image.height);
    ctx = this.image.getContext('2d');
    sx = this.shadowOffset.x < 0 ? 0 : this.shadowOffset.x;
    sy = this.shadowOffset.y < 0 ? 0 : this.shadowOffset.y;
    x = this.shadowOffset.x < 0 ? Math.abs(this.shadowOffset.x) : 0;
    y = this.shadowOffset.y < 0 ? Math.abs(this.shadowOffset.y) : 0;
    if (this.shadowColor) {
        ctx.drawImage(
            this.symbolCanvasColored(this.shadowColor),
            sx,
            sy
        );
    }
    ctx.drawImage(
        this.symbolCanvasColored(this.color),
        x,
        y
    );
};

SymbolMorph.prototype.symbolCanvasColored = function (aColor) {
    var canvas = newCanvas(new Point(this.symbolWidth(), this.size));

    switch (this.name) {
        case 'save':
            return this.drawSymbolSave(canvas, aColor);
        case 'importTable':
            return this.drawSymbolDirectoryTable(canvas, aColor);
        case 'importQuery':
            return this.drawSymbolDirectoryQuery(canvas, aColor);
        case 'view':
            return this.drawSymbolView(canvas, aColor);
        default:
            return canvas;
    }
};

SymbolMorph.prototype.symbolWidth = function () {
    // private
    var size = this.size;

    switch (this.name) {
        case 'view':
            return size * 2;
        case 'importTable':
            return size + size / 2;
        case 'importQuery':
            return size + size / 2;
        default:
            return size;
    }
};

SymbolMorph.prototype.drawSymbolSave = function (canvas, color) {
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = "darkorange";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "Bisque";
    ctx.fillRect(canvas.width / 8, 0, canvas.width / 1.5, canvas.height / 2);
    ctx.fillRect(canvas.width / 5, canvas.height / 1.5, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = "darkorange";
    ctx.fillRect(canvas.width / 3.5, canvas.height / 1.3, canvas.width / 8, canvas.height / 4);
    return canvas;
};

SymbolMorph.prototype.drawSymbolDirectoryTable = function (canvas, color) {
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = "orange";
    ctx.fillRect(0, canvas.height / 7, canvas.width / 1.2, canvas.height);
    ctx.fillRect(canvas.width / 9, 0, canvas.width / 4, canvas.height / 8);
    ctx.fillStyle = "Bisque";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width / 8, canvas.height / 4);
    ctx.lineTo(canvas.width, canvas.height / 4);
    ctx.lineTo(canvas.width / 1.2, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(canvas.width / 2.5, canvas.height / 1.5, canvas.height / 5.5, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(canvas.width / 2.2, canvas.height / 1.5, canvas.width / 6, canvas.height / 6);
    ctx.fillRect(canvas.width / 1.7, canvas.height / 1.8, canvas.width / 4, canvas.height / 3.8);
    var t = new StringMorph("T", canvas.height / 3, null, false, false, null, null, null, 'white');
    t.setPosition(new Point(canvas.width / 2.75, canvas.height / 1.9));
    this.add(t);
    return canvas;
};

SymbolMorph.prototype.drawSymbolDirectoryQuery = function (canvas, color) {
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = "orange";
    ctx.fillRect(0, canvas.height / 7, canvas.width / 1.2, canvas.height);
    ctx.fillRect(canvas.width / 9, 0, canvas.width / 4, canvas.height / 8);
    ctx.fillStyle = "Bisque";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width / 8, canvas.height / 4);
    ctx.lineTo(canvas.width, canvas.height / 4);
    ctx.lineTo(canvas.width / 1.2, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "OrangeRed";
    ctx.strokeStyle = "OrangeRed";
    ctx.beginPath();
    ctx.arc(canvas.width / 1.8, canvas.height / 2, canvas.height / 6, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(canvas.width / 1.8, canvas.height / 1.7);
    ctx.lineTo(canvas.width / 1.8, canvas.height / 1.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width / 1.8, canvas.height, canvas.height / 6.5, Math.PI, 0);
    ctx.stroke();
    ctx.fillRect(canvas.width / 1.6, canvas.height / 1.9, canvas.width / 10, canvas.height / 8);
    ctx.fillRect(canvas.width / 1.4, canvas.height / 2.1, canvas.width / 5.5, canvas.height / 6);
    return canvas;
};

SymbolMorph.prototype.drawSymbolView = function (canvas, color) {
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = "darkorange";
    ctx.beginPath();
    ctx.arc(canvas.width / 5, canvas.height / 2, canvas.height / 2.5, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(canvas.width / 5, canvas.height / 1.5, canvas.width / 2, canvas.height / 4);
    ctx.fillRect(canvas.width / 2, canvas.height / 3, canvas.width / 2, canvas.height / 1.7);
    ctx.fillStyle = "orange";
    var view = new StringMorph("View", canvas.height / 2.2, null, false, false, null, null, null, 'white');
    view.setPosition(new Point(canvas.width / 1.9, canvas.height / 3));
    this.add(view);
    return canvas;
};



