package main

import (
	"bufio"
	"fmt"
	"github.com/go-echarts/go-echarts/v2/charts"
	"github.com/go-echarts/go-echarts/v2/components"
	"github.com/go-echarts/go-echarts/v2/opts"
	"io"
	"io/ioutil"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
)

var respath = "./line"
var origfname = "./data/hutchinson.csv"
var watertmpfname = "./data/hutchinson_water_temp.txt"
var airtmpfname = "./data/hutchinson_air_temp.txt"

type lineData struct {
	date string
	data float32
}

type linesort []lineData

func (a linesort) Len() int { return len(a) }
func (a linesort) Less(i, j int) bool {
	p, err := time.Parse("01/02/2006 15:04", a[i].date)
	chkerr(err)
	q, err := time.Parse("01/02/2006 15:04", a[j].date)
	chkerr(err)
	return p.Before(q)
}
func (a linesort) Swap(i, j int) { a[i], a[j] = a[j], a[i] }

func getVals(d []lineData) []opts.LineData {
	res := []opts.LineData{}
	for _, v := range d {
		res = append(res, opts.LineData{Value: v.data, Name: v.date})
	}
	return res
}

func getDates(d []lineData) []string {
	res := []string{}
	for _, v := range d {
		res = append(res, v.date)
	}
	return res
}

func removeDuplicateValues(d []lineData) []lineData {
	keys := make(map[string]bool)
	list := []lineData{}

	// If the key(values of the slice) is not equal
	// to the already present value in new slice (list)
	// then we append it. else we jump on another element.
	for _, entry := range d {
		if _, value := keys[entry.date]; !value {
			keys[entry.date] = true
			list = append(list, entry)
		} else {
			fmt.Println("found duplicate\n", entry)
		}
	}
	return list
}

func dataFromFile(fname string) []lineData {
	var res []lineData

	file, err := os.Open(fname)
	chkerr(err)
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		t := scanner.Text()
		lineval := strings.Fields(t)
		if len(lineval) == 4 {
			ldata, err := strconv.ParseFloat(lineval[2], 32)
			chkerr(err)
			res = append(res, lineData{date: lineval[0] + " " + lineval[1], data: float32(ldata)})
		} else {
			fmt.Println("missing value for date: " + lineval[0] + " " + lineval[1])
		}
	}
	chkerr(scanner.Err())

	sort.Sort(linesort(res))

	res = removeDuplicateValues(res)

	return res
}

func generateAreaC(d []lineData, d2 []lineData, d3 []lineData) *charts.Line {
	line := charts.NewLine()

	line.SetXAxis(getDates(d)).AddSeries("River Discharge", getVals(d),
		charts.WithLabelOpts(opts.Label{
			Show: false,
		}),
		charts.WithAreaStyleOpts(opts.AreaStyle{
			Color:   "#0465db",
			Opacity: 0.3,
		}),
		charts.WithLineChartOpts(opts.LineChart{
			Smooth: true,
		}),
		charts.WithLineStyleOpts(opts.LineStyle{
			Color: "#1cace6",
		}),
		charts.WithMarkPointStyleOpts(opts.MarkPointStyle{
			Label: &opts.Label{
				Color: "#1cace6",
			},
		},
		))

	line.AddSeries("Water Temp", getVals(d2),
		charts.WithLabelOpts(opts.Label{
			Show: false,
		}),
		charts.WithLineChartOpts(opts.LineChart{
			Smooth:     true,
			YAxisIndex: 1,
		}),
		charts.WithLineStyleOpts(opts.LineStyle{
			Color: "#43e7f0",
		}))

	line.AddSeries("Air Temp", getVals(d3),
		charts.WithLabelOpts(opts.Label{
			Show: false,
		}),
		charts.WithLineChartOpts(opts.LineChart{
			Smooth:     true,
			YAxisIndex: 1,
		}),
		charts.WithLineStyleOpts(opts.LineStyle{
			Color: "#DF013A",
		}))

	line.SetGlobalOptions(
		charts.WithInitializationOpts(opts.Initialization{
			PageTitle: "River Discharge",
			Width:     "100%",
			Height:    "97%",
			Theme:     "dark",
		}),
		charts.WithYAxisOpts(opts.YAxis{
			Scale: true,
		}),
		charts.WithTitleOpts(opts.Title{
			Title: "River Discharge: Hutchinson Creek, Acme, WA",
		}),
		charts.WithDataZoomOpts(opts.DataZoom{
			Type:       "inside",
			Start:      23,
			End:        35,
			XAxisIndex: []int{0},
		}),
		charts.WithDataZoomOpts(opts.DataZoom{
			Type:       "slider",
			Start:      23,
			End:        35,
			XAxisIndex: []int{0},
		}),
		charts.WithTooltipOpts(opts.Tooltip{
			Trigger:   "axis",
			TriggerOn: "click",
			Show:      true,
			Formatter: "Date: {b}<br/>Discharge: {c} (cfs)<br/>Air Temp: {c2} °C<br/>Water Temp: {c1} °C",
		}),
		charts.WithToolboxOpts(opts.Toolbox{
			Show:   true,
			Orient: "horizontal",
			Left:   "2.2%",
			Top:    "5%",
			Feature: &opts.ToolBoxFeature{
				nil,
				nil,
				&opts.ToolBoxFeatureDataView{
					Show:  true,
					Title: "View Data",
					Lang:  []string{"Data View", "Exit"},
				},
				nil,
			},
		}),
		charts.WithLegendOpts(opts.Legend{
			Show: true,
		}),
	)

	return line
}

func chkerr(err error) {
	if err != nil {
		panic(err)
	}
}

func main() {
	d := dataFromFile(origfname)
	d2 := dataFromFile(watertmpfname)
	d3 := dataFromFile(airtmpfname)
	respath := "./line.html"

	page := components.NewPage()
	page.AddCharts(
		generateAreaC(d, d2, d3),
	)
	f, err := os.Create(respath)
	chkerr(err)
	page.Render(io.MultiWriter(f)) //write initial plot to file
	f.Close()

	//make readonly, and resize edits
	reptoolb, err := regexp.Compile(`"toolbox":{.*}}}`) //find toolbox
	chkerr(err)
	genname, err := regexp.Compile("goecharts_.* =") //find script to replace
	chkerr(err)
	addresponsiveness, err := regexp.Compile(`\s+</script>`) //find script to replace
	chkerr(err)
	fixslidercolors, err := regexp.Compile(`"dataZoom":\[.*?\],`) //find toolbox
	chkerr(err)
	fixtitle, err := regexp.Compile(`<title>.*</title>`) //find toolbox
	chkerr(err)
	htmlresize, err := regexp.Compile(`<html>`) //fix dynamic resize vertical
	chkerr(err)
	bodyresize, err := regexp.Compile(`<body>`) //fix dynamic resize vertical
	chkerr(err)
	contresize, err := regexp.Compile(`<div class="container">`) //fix dynamic resize vertical
	chkerr(err)
	multiyaxis, err := regexp.Compile(`"yAxis":\[.*?};`)
	chkerr(err)
	addcolors, err := regexp.Compile(`option_.* = {`) //fix legend colors using global echarts opt
	chkerr(err)

	b, err := ioutil.ReadFile(respath)
	chkerr(err)

	oldtoolbox := reptoolb.FindAllString(string(b), -1)

	oldslider := fixslidercolors.FindAllString(string(b), -1)
	oldsliderstr := oldslider[0][0 : len(oldslider[0])-1]
	oldcolor := addcolors.FindAllString(string(b), -1)
	fmt.Println("oldcolor")
	fmt.Println(oldcolor)

	namestr := genname.FindAllString(string(b), -1)
	namestrsing := namestr[0][:len(namestr[0])-2]
	var newall []byte

	fmt.Println(oldtoolbox)
	fmt.Println(oldsliderstr)
	fmt.Println(namestr)
	fmt.Println(namestrsing)

	if len(oldslider) == 1 { //if we only have one result, edit the html
		newtoolbox := oldtoolbox[0][:len(oldtoolbox[0])-3] + `,"readOnly":true}}}`
		newslider := oldslider[0][:len(oldslider[0])-3] + `,handleColor: '#eb8146',textStyle:{color:"#ffffff"},dataBackground:{lineStyle:{color:"#ffffff"},areaStyle:{color:"#ffffff"}}}],`
		newcolor := oldcolor[0] + `"color":["#1cace6","#43e7f0","#DF013A"],`
		newall = reptoolb.ReplaceAll(b, []byte(newtoolbox))
		newall = fixslidercolors.ReplaceAll(newall, []byte(newslider))
		newall = fixtitle.ReplaceAll(newall, []byte(`<title>River Discharge</title>`))
		//fix resizes
		newall = htmlresize.ReplaceAll(newall, []byte(`<html style="width: 100%;height:100%;">`))
		newall = bodyresize.ReplaceAll(newall, []byte(`<body style="width: 100%;height:100%;">`))
		newall = contresize.ReplaceAll(newall, []byte(`<div class="container" style="width: 100%;height:100%;bottom:2%">`))
		newall = multiyaxis.ReplaceAll(newall, []byte(`"yAxis":[[{"scale":true}],[{"scale":true}]]};`))
		newall = addcolors.ReplaceAll(newall, []byte(newcolor))

		fmt.Println(namestrsing)
		newendscript := addresponsiveness.FindAllString(string(newall), -1)
		if len(newendscript) == 1 {
			fmt.Println("adding new end script")
			newendstr := `

			window.onresize = function(){
        		if(` + namestrsing + `!= null && ` + namestrsing + ` != undefined){
            		` + namestrsing + `.resize();
        		}
    		}
 </script>`

			newall = addresponsiveness.ReplaceAll(newall, []byte(newendstr))
		}

		ioutil.WriteFile(respath, newall, 0) //rewrite html
	}

}
