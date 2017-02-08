//import jQuery = require("jquery");
//import agGrid = require("ag-grid");


function alertCellRender(params)
{
    let t : string;
    if (params.data.data.S[params.slide])
    {
         t =  '<div style="height:24px;width:24px;margin:0 auto;"><svg version="1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="100%" height="100%" viewBox="59 19 157 157" enable-background="new 58.954 18.776 157 157" xml:space="preserve"><g><path fill="#BE202E" stroke="#FFFFFF" stroke-width="1" d="M181 115c-4 0-6-3-6-7l0-40c0-4 3-6 7-6 3 0 6 3 6 7l0 40C187 112 184 115 181 115zM180 137c-4 0-6-3-6-7 0-3 3-7 7-7 3 0 7 3 6 7C187 134 184 137 180 137z"/><set id="show" attributeName="visibility" attributeType="CSS" to="visible" begin="0s; hide.end" dur="0.7s" fill="freeze"/><set id="hide" attributeName="visibility" attributeType="CSS" to="hidden" begin="show.end" dur="0.3s" fill="freeze"/></g><path fill="#231F20" d="M88 64L107 43c1-1 2-1 2-1h41c6 0 10 5 10 10v90c0 6-5 10-10 10H98c-6 0-10-5-10-10V66C87 65 87 64 88 64zM94 142c0 2 2 4 4 4h53c2 0 4-2 4-4V52c0-2-2-4-4-4h-40L94 67l0 0V142zM138 129c0 2-1 3-3 3h-23c-2 0-3-1-3-3v-23c0-2 1-3 3-3h23c2 0 3 1 3 3V129zM138 93c0 2-1 3-3 3h-23c-2 0-3-1-3-3V70c0-2 1-3 3-3h23c2 0 3 1 3 3V93z"/></svg></div>';
    }
    else
    { 
        t =  '<div style="background:'+ ((params.data.data.S[ params.alert]) ? '#cf0404' : '#91e842') + ';height:9px;width:9px;display:inline-block;vertical-align:middle"></div> ';
        if (params.value)
        {
            t = t + params.value;
        } 
        else
        {
            t = "---";
        }
    } 
    return t;
}
var columnDefs = [

    {headerName: "Date", field: "TS", cellRenderer: function (params) {   
           return new Date(params.value * 1000).toLocaleTimeString();
    }},
    {headerName: "Name", field: "name", cellRenderer: 'group'}, 
    {headerName: "Type", field: "type", 
        cellRenderer: function (params) {   
            switch(params.value)
            {
                case 1:
                    return "Home";
                case 2:
                    return "Pond";
                case 3:
                    return "Reef";
            }
    }}, 
    {headerName: "In Water", field: "data.S.W", 
        cellRenderer: function (params) {   
            return ((params.value) ? '<div style="background:lightblue;height:9px;width:9px;"></div>':'<div style="border:1px solid black;height:9px;width:9px;"></div>');
    }}, 
    {headerName: "T", field: "data.T",  cellRenderer: alertCellRender,
         cellRendererParams : {
            alert: 'T'
    } }, 
    {headerName: "pH", field: "data.P",  cellRenderer: alertCellRender,
         cellRendererParams : {
            alert: 'P',
            slide: 'S'
    } },  
    {headerName: "NH3", field: "data.N",  cellRenderer: alertCellRender,
         cellRendererParams : {
            alert: 'N',
            slide: 'S'
    } },  
    {headerName: "Par", field: "data.A"}, 
    {headerName: "Lux", field: "data.L"}, 
    {headerName: "Kelvin", field: "data.K"}, 
]; 
  
(function ( $ ) {


    let webSocket;
    let grid;
    let gridOptions = { 
        columnDefs: columnDefs, 
        rowData: [] 
    };
    function handleOpenWs()
    {
        $("#Vc").removeClass("s1 s2 s3").addClass("s1"); 
    }
    function handleCloseWs()
    {
        $("#Vc").removeClass("s1 s2 s3").addClass("s3");
    }
    function handleMessage(e)
    { 
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
}( jQuery ));
 