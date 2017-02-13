/*
 * Copyright (C) 2017 IgorStrykhar  in  SMI2
 * All rights reserved.
 * GPLv3
 */

'use strict';

class DrawEcharts {
    constructor(Widget,drawType) {
        // `<echarts options="widget.draw.options" height="100%" ng-if="widget.draw.init" width="100%"></echarts>`
        console.warn("Draw   Echarts constructor",Widget.drawCommnads,drawType);
        this.type=drawType.toUpperCase();
        this.library = 'echarts';
        this.widget = Widget;
        this.init = false;
        this.options={
                version: 3,
                backgroundColor: '#404a59',
                title : {
                    text: 'EChart',
                    subtext: 'subtext',
                    left: 'center',
                    textStyle : {
                        color: '#fff'
                    }
                },
        };// opthios
    }

    onResize() {

    }

    preProcessor() {
        if (this.type=='MAP') {
            this.init=this.createMAP();
        }
        this.config = {
            theme:'default',
            // event: [{click:onClick}],
            dataLoaded:true
        };

        this.options = {
            title : {
                text: '未来一周气温变化(5秒后自动轮询)',
                subtext: '纯属虚构'
            },
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                data:['最高气温','最低气温']
            },
            toolbox: {
                show : true,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    magicType : {show: true, type: ['line', 'bar']},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : false,
                    data : ['周一','周二','周三','周四','周五','周六','周日']
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel : {
                        formatter: '{value} °C'
                    }
                }
            ],
            series : [
                {
                    name:'最高气温',
                    type:'line',
                    data:[11, 11, 15, 13, 12, 13, 10],
                    markPoint : {
                        data : [
                            {type : 'max', name: '最大值'},
                            {type : 'min', name: '最小值'}
                        ]
                    },
                    markLine : {
                        data : [
                            {type : 'average', name: '平均值'}
                        ]
                    }
                },
                {
                    name:'最低气温',
                    type:'line',
                    data:[1, -2, 2, 5, 3, 2, 0],
                    markPoint : {
                        data : [
                            {name : '周最低', value : -2, xAxis: 1, yAxis: -1.5}
                        ]
                    },
                    markLine : {
                        data : [
                            {type : 'average', name : '平均值'}
                        ]
                    }
                }
            ]
        };
        console.info('preProcessor',this.init,this.options);
    }



    createMAP() {
        this.widget.height=3;
        this.widget.width=2;

        // массив состоящий
        let series=[
            {
                type: 'scatter',
                coordinateSystem: 'geo',
                data: this.widget.data.data.map(function (itemOpt) {

                    return {
                        name: itemOpt.name_ru,
                        value: [
                            itemOpt.longitude,
                            itemOpt.latitude,
                            itemOpt.views_count
                        ],

                        label: {
                            emphasis: {
                                position: 'right',
                                show: true
                            }
                        },
                    };

                })
            }
        ];

        console.log(series);



        let o={
            tooltip : {
                trigger: 'item'
            },
            // legend: {
            //     orient: 'vertical',
            //     top: 'bottom',
            //     left: 'right',
            //     data:['data Top10', 'data Top10', 'data Top10'],
            //     textStyle: {
            //         color: '#fff'
            //     },
            //     selectedMode: 'single'
            // },
            geo: {
                name: 'World Population (2010)',
                type: 'map',
                map: 'world',
                label: {
                    emphasis: {
                        show: false
                    }
                },
                visualMap: {
                    show: false,
                    min: 0,
                    max: 100,// max,
                    inRange: {
                        symbolSize: [6, 60]
                    }
                },
                roam: true,
                itemStyle: {
                    normal: {
                        areaColor: '#323c48',
                        borderColor: '#404a59'
                    },
                    emphasis: {
                        areaColor: '#2a333d'
                    }
                }
            },
            series: series
        };

        this.options=Object.assign(o,this.options);
        return true;
    }
}


class DrawAMcharts {
    constructor(Widget) {
        console.warn("DrawAMcharts constructor");
        this.library='amchart';
        this.init=false;
        this.options={};
        this.widget = Widget;
        this.widget.height=2;
        this.widget.width=2;


    }
    onResize () {
        this.makeLegend();
    }
    preProcessor () {

        if (this.createChart()) {
            this.init=true;
        }


        console.log("!preProcessor,done",this.init,this.options);



    }



    getDrawCodeObject() {
        let drawCommand=this.widget.drawCommnads;

        if (!drawCommand) {
            return [];
        }

        let codeDrawText=false;
        if (drawCommand && drawCommand.code ){
            codeDrawText=drawCommand.code;
        }
        if (!codeDrawText)
        {
            return [];
        }


        let result=[];

        try {
            let code='('+codeDrawText+')';

            console.warn("drawCommand:CODE:",code);
            let object=eval(code);
            console.warn("drawCommand:Result:",object);
            result.push(object);

            // // получаем настройки по осям
            // meta.forEach((i) => {
            //     // получаем ключь для каждой оси
            //     if (object[i.name])
            //     {
            //         chartSets[i.name]=object[i.name];
            //     }
            // });
        } catch (E) {
            console.error('error eval ',code);
        }
        return result;

    };

    createChart() {


        let chartSets={};

        let meta=this.widget.data.meta;
        let drawCodeObject=[];
        try {
            drawCodeObject=this.getDrawCodeObject();
        }
        catch (E) {
            console.error('error eval ', E);
        }
        console.log('drawCodeObject',drawCodeObject);
        // ------------- Create Axes
        //
        //

        let dataDateFormat=false;
        let categoryField="";
        let minPeriod='mm';//minute
        let graphs=[];
        let counter=0;
        let axes=[];
        meta.forEach((i) => {

            if (i.type=='DateTime') {
                dataDateFormat="YYYY-MM-DD JJ:NN:SS";
                categoryField=i.name;
            }else {
                if (i.type=='Date') {
                    dataDateFormat="YYYY-MM-DD";
                    minPeriod='DD';
                    categoryField=i.name;
                }
                else {
                    if (!categoryField)
                    {
                        categoryField=i.name;
                        return;
                    }
                    counter=counter+1;
                    let g=this.getChartGraph(i,chartSets[i.name]);
                    g.id='g'+counter;


                    if (g.valueAxis!=='v1')
                    {
                        axes.push(g.valueAxis);
                    }
                    graphs.push(g);
                }
            }
        });

        let obl={

            theme: Widget.isDark ? 'dark' : 'light',
            color: Widget.isDark ? '#eee' : '#333',
            // marginRight: 50,
            // marginLeft: 50,
            // "handDrawn":true,
            // "autoMarginOffset": 50,
            // "autoResize":true,
            // "marginBottom": 30,
            // "marginsUpdated": true,
            // "marginTop": 10,
            // pathToImages: 'https://cdnjs.cloudflare.com/ajax/libs/amcharts/3.13.0/images/',
            // "handDrawn":true,
            // "autoMarginOffset": 50,
            // "autoResize":true,
            // "marginBottom": 30,
            // "marginsUpdated": true,
            // "marginTop": 10,


            "type": "serial",
            // "startDuration": 0.1,

            "categoryField": categoryField,

            "valueAxes": [ {
                "id": "v1",
                "axisAlpha": 1,
                // "stackType": "100%",// "stackType": "regular",
                "gridAlpha": 0.07,
                "axisColor": Widget.isDark ? '#eee' : '#333',
                "gridColor": Widget.isDark ? '#eee' : '#333',
                // "axisThickness": 2,
                // "position": "left",
                "ignoreAxisWidth": true
            } ],

            "balloon": {  "borderThickness": 1,  "shadowAlpha": 0
            },

            "graphs": graphs ,
            "chartCursor": {
                "valueLineEnabled": true,
                "valueLineBalloonEnabled": true,
                "cursorAlpha": 0,
                "zoomable": false,
                "valueZoomable": true,
                "valueLineAlpha": 0.5
            },

            // "valueScrollbar": {
            // "autoGridCount": true,
            // "color": "#000000",
            // "scrollbarHeight": 1
            // },

            "chartScrollbar": {
                "graph":"g1",
                "gridAlpha":0,
                "color":"#888888",
                "scrollbarHeight":25,
                "backgroundAlpha":0,
                "selectedBackgroundAlpha":0.1,
                "selectedBackgroundColor":"#888888",
                "graphFillAlpha":0,
                "autoGridCount":true,
                "selectedGraphFillAlpha":0,
                "graphLineAlpha":0.2,
                "graphLineColor":"#c2c2c2",
                "selectedGraphLineColor":"#888888",
                "selectedGraphLineAlpha":1
            },
            "categoryAxis": {
                "dashLength": 1,
                "minorGridEnabled": true,
                "axisColor": Widget.isDark  ? '#eee' : '#333',
                "gridColor": Widget.isDark  ? '#eee' : '#333'
            },
            "data": this.widget.data.data,

        };



        // dateforamt
        obl.categoryAxis.parseDates=false;

        if (dataDateFormat)
        {
            obl.dataDateFormat=dataDateFormat;
            obl.categoryAxis.parseDates=true;
            obl.categoryAxis.minPeriod=minPeriod;
        }

        if (axes)
        {
            let a_offset=0;
            axes.forEach((a) => {
                a_offset++;
                let ax=
                    {
                        "id": a,
                        "axisAlpha": 1,
                        "axisThickness": 1,
                        "position": "right",
                        "ignoreAxisWidth": true,
                        "offset": 1 * a_offset
                    };
                obl.valueAxes.push(ax);
            });
        }


        //
        this.options=obl;
        this.init=true;
        this.makeLegend();


        return true;



    };// create chart


    makeLegend(){


console.log("this.widget.sizeY",this.widget.sizeY);
        if (this.widget.sizeY<2) {
            delete this.options.legend;
        }
        else
        {
            this.options.legend= {
                "align": "center",
                "equalWidths": false,
                "periodValueText": "total: [[value.sum]]",
                "valueAlign": "left",
                "valueText": "[[value]] ([[percents]]%)",
                "valueWidth": 100
            };
        }
        console.warn(this.options);
    };
    getChartGraph (meta,chartSets){

        // SELECT number,sin(number),cos(number),number as `Title [asix=g2:column:blue]`  from system.numbers limit 40
        let showname=meta.name;
        let name=meta.name;
        let useaxis="v1";

        showname=showname.replace(/_axis\d+/gm,'');
        // showname=showname.replace(/_column\d+/gm,'');

        var re=/.*_axis(\d+).*/i;
        var axis = name.match(re);


        if (axis && axis[1])
        {
            useaxis='v'+axis[1];
        }
        let f= {
            "id": "g1",
            "valueAxis": useaxis,
            "fillAlphas": 0.2,
            "bullet": "round",
            "bulletSize": 8,
            "hideBulletsCount": 50,
            "lineThickness": 1,
            "title": showname,
            "useLineColorForBulletBorder": true,
            "valueField": name,
            "type": "smoothedLine",
            "balloonText": "[[title]] [[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>"
        };

        if (!chartSets) chartSets={};

        return Object.assign(f,chartSets);
    }; // getChartGraph



}

class DrawD3 {
    constructor(Widget) {

        this.library='d3';
        this.widget = Widget;
        this.init=false;
    }
}

class DrawC3 {
    constructor(Widget) {
        this.library='c3';
        this.widget = Widget;
        this.init=false;
    }

}