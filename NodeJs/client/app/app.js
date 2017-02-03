//import jQuery = require("jquery");
//import agGrid = require("ag-grid");
function alertCellRender(params) {
    return '<div style="background:' + ((params.data.data.S[params.alert]) ? '#cf0404' : '#91e842') + ';height:9px;width:9px;display:inline-block;vertical-align:middle"></div> ' + params.value;
}
var columnDefs = [
    { headerName: "Date", field: "TS", cellRenderer: function (params) {
            return new Date(params.value * 1000).toLocaleTimeString();
        } },
    { headerName: "Name", field: "name", cellRenderer: 'group' },
    { headerName: "Type", field: "type",
        cellRenderer: function (params) {
            switch (params.value) {
                case 1:
                    return "Home";
                case 2:
                    return "Pond";
                case 3:
                    return "Reef";
            }
        } },
    { headerName: "In Water", field: "data.S.W",
        cellRenderer: function (params) {
            return ((params.value) ? '<div style="background:lightblue;height:9px;width:9px;"></div>' : '<div style="border:1px solid black;height:9px;width:9px;"></div>');
        } },
    { headerName: "T", field: "data.T", cellRenderer: alertCellRender,
        cellRendererParams: {
            alert: 'T'
        } },
    { headerName: "pH", field: "data.P", cellRenderer: alertCellRender,
        cellRendererParams: {
            alert: 'P'
        } },
    { headerName: "NH3", field: "data.N", cellRenderer: alertCellRender,
        cellRendererParams: {
            alert: 'N'
        } },
    { headerName: "Par", field: "data.A" },
    { headerName: "Lux", field: "data.L" },
    { headerName: "Kelvin", field: "data.K" },
];
(function ($) {
    let webSocket;
    let grid;
    let gridOptions = {
        columnDefs: columnDefs,
        rowData: []
    };
    function handleOpenWs() {
        $("#Vc").removeClass("s1 s2 s3").addClass("s1");
    }
    function handleCloseWs() {
        $("#Vc").removeClass("s1 s2 s3").addClass("s3");
    }
    function handleMessage(e) {
        gridOptions.api.setRowData(JSON.parse(e.data));
        gridOptions.api.sizeColumnsToFit();
    }
    $(document).ready(function () {
        this.webSocket = new WebSocket("ws://" + window.location.hostname + ":8001");
        this.webSocket.onmessage = handleMessage;
        this.webSocket.onopen = handleOpenWs;
        this.webSocket.onclose = handleCloseWs;
        grid = new agGrid.Grid($("#Vb")[0], gridOptions);
    });
    return this;
}(jQuery));

//# sourceMappingURL=app.js.map
