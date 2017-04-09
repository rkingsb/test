google.load("visualization", "1", {packages: ["corechart", "bar"]});

$(document).ready(function () {
    $("#data-tables-wrapper").resizable({
        handles: 'w'
    });

    $('.chart-modal').dialog({
        autoOpen: false,
        height: $(window).height() * .4,
        width: $(window).width() * .6,
        modal: true
    });

    $('.chart-modal').find('.chart-type').change(function () {
        if ($(this).val() == 'Pie') {
            $('.yAxis-opts').fadeOut(200, function () {
                console.log($(this).val());
                if ($(this).val() == null) {
                    $('.yAxis-opts option').attr('selected', false);
                    $('.yAxis-opts option:first').attr('selected', true);
                }
            });
        } else {
            $('.yAxis-opts').fadeIn(200);
        }
    });
});

function createChart() {
    var modal = $(".chart-modal");
    var dataType = modal.find('.modal-data-type').val();
    var chartType = modal.find('.chart-type').val();
    var xVal = modal.find('.xAxis-opts').val();
    var yVal = modal.find('.yAxis-opts').val();

    // validate
    var errorText = [];
    if (chartType == '' || chartType == null) {
        errorText.push("<p>Chart Type is required.</p>");
    }
    if (xVal == '' || xVal == null) {
        errorText.push("<p>X Axis is required.</p>");
    }
    if (yVal == '' || yVal == null) {
        errorText.push("<p>Y Axis is required.</p>");
    }
    if (errorText.length > 0) {
        modal.find('.errorText').html(errorText).fadeIn();
        return false;
    } else {
        modal.find('.errorText').html('').fadeOut();
    }
    var tableData = dataType == "query" ? queryChartData : nodeChartData;
    var chartData = [];

    // get x/y values from chart data
    $.each(tableData, function (key, val) {
        chartData.push([val[xVal], parseFloat(val[yVal])]);
    });
    console.log(chartData);

    var chart, data, options;
    var wrapper = document.getElementById('chart-wrapper');

    if (chartType == "Area") {
        chart = new google.visualization.AreaChart(wrapper);
        data = new google.visualization.DataTable();
        data.addColumn('string', xVal);
        data.addColumn('number', yVal);
        $.each(chartData, function (key, arr) {
            data.addRow([arr[0].toString(), parseFloat(arr[1])]);
        });
        options = ({
            legend: {position: 'none'},
            animation: {startup: true, duration: 1000}
        });
        chart.draw(data, options);
    } else if (chartType == "Bar") {
        chart = new google.charts.Bar(wrapper);
        data = new google.visualization.DataTable();
        data.addColumn('string', xVal);
        data.addColumn('number', yVal);
        $.each(chartData, function (key, arr) {
            data.addRow([arr[0].toString(), parseFloat(arr[1])]);
        });
        options = ({
            legend: {position: 'none'},
            animation: {startup: true, duration: 1000},
            bars: "horizontal"
        });
        chart.draw(data, google.charts.Bar.convertOptions(options));

    } else if (chartType == "Column") {
        chart = new google.charts.Bar(wrapper);
        data = new google.visualization.DataTable();
        data.addColumn('string', xVal);
        data.addColumn('number', yVal);
        $.each(chartData, function (key, arr) {
            data.addRow([arr[0].toString(), parseFloat(arr[1])]);
        });
        options = ({
            legend: {position: 'none'},
            animation: {startup: true, duration: 1000},
            bars: "vertical"
        });
        chart.draw(data, google.charts.Bar.convertOptions(options));
    } else if (chartType == "Histogram") {
        chart = new google.visualization.Histogram(wrapper);
        data = new google.visualization.DataTable();
        data.addColumn('string', xVal);
        data.addColumn('number', yVal);
        $.each(chartData, function (key, arr) {
            data.addRow([arr[0].toString(), parseFloat(arr[1])]);
        });
        options = ({
            legend: {position: 'none'},
            animation: {startup: true, duration: 1000}
        });
        chart.draw(data, options);
    } else if (chartType == "Line") {
        chart = new google.visualization.LineChart(wrapper);
        data = new google.visualization.DataTable();
        data.addColumn('string', xVal);
        data.addColumn('number', yVal);
        $.each(chartData, function (key, arr) {
            data.addRow([arr[0].toString(), parseFloat(arr[1])]);
        });
        options = ({
            legend: {position: 'none'},
            animation: {startup: true, duration: 1000}
        });
        chart.draw(data, options);
    } else if (chartType == "Pie") {
        chart = new google.visualization.PieChart(wrapper);
        data = new google.visualization.DataTable();
        data.addColumn('string', xVal);
        data.addColumn('number', 'Count');
        // get aggregated counts
        var groupedCount = {};
        $.each(chartData, function (key, arr) {
            // does group exist?
            if (groupedCount[arr[0]] > 0) {
                groupedCount[arr[0]]++;
            } else {
                groupedCount[arr[0]] = 1;
            }
        });

        $.each(groupedCount, function (key, val) {
            data.addRow([key + " (" + val + ")", val]);
        });
        options = ({
            animation: {startup: true, duration: 1000},
            is3D: true
        });
        chart.draw(data, options);

    }

}
