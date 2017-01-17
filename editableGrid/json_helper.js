function jsonify_data(data, editable) {

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
                var obj = {
                    "name": name,
                    "label": name,
                    "datatype": num == true ? "double" : "string",
                    "editable": j == 1 ? false : editable
                };
                fields.push(obj);
            }
        });
    });

    return {"metadata": fields, "data": rows};
    
}
