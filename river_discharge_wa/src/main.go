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

func dataFromFile() []lineData {
	var res []lineData

	file, err := os.Open(origfname)
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
		}
	}
	chkerr(scanner.Err())

	sort.Sort(linesort(res))

	return res
}

func generateAreaC(d []lineData) *charts.Line {
	line := charts.NewLine()

	line.SetXAxis(getDates(d)).AddSeries("River Discharge", getVals(d)).
		SetSeriesOptions(
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
		)

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
			Start:      88,
			End:        100,
			XAxisIndex: []int{0},
		}),
		charts.WithDataZoomOpts(opts.DataZoom{
			Type:       "slider",
			Start:      88,
			End:        100,
			XAxisIndex: []int{0},
		}),
		charts.WithTooltipOpts(opts.Tooltip{
			Trigger:   "axis",
			TriggerOn: "click",
			Show:      true,
			Formatter: "Date: {b}<br/>Obs: {c} (cfs)",
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
	)
	return line
}

func chkerr(err error) {
	if err != nil {
		panic(err)
	}
}

func main() {
	d := dataFromFile()
	respath := "./line.html"

	page := components.NewPage()
	page.AddCharts(
		generateAreaC(d),
	)
	f, err := os.Create(respath)
	chkerr(err)
	page.Render(io.MultiWriter(f)) //write initial plot to file
	f.Close()

	//make readonly, and resize edits
	reptoolb, err := regexp.Compile("toolbox: {.*}}}") //find toolbox
	chkerr(err)
	genname, err := regexp.Compile("myChart_.* =") //find script to replace
	chkerr(err)
	addresponsiveness, err := regexp.Compile(`\s+</script>`) //find script to replace
	chkerr(err)
	fixslidercolors, err := regexp.Compile(`dataZoom:\[.*\]`) //find toolbox
	chkerr(err)
	fixtitle, err := regexp.Compile(`<title>.*</title>`) //find toolbox
	chkerr(err)
	htmlresize, err := regexp.Compile(`<html>`) //fix dynamic resize vertical
	chkerr(err)
	bodyresize, err := regexp.Compile(`<body>`) //fix dynamic resize vertical
	chkerr(err)
	contresize, err := regexp.Compile(`<div class="container">`) //fix dynamic resize vertical
	chkerr(err)

	b, err := ioutil.ReadFile(respath)
	chkerr(err)

	oldtoolbox := reptoolb.FindAllString(string(b), -1)
	oldslider := fixslidercolors.FindAllString(string(b), -1)
	namestr := genname.FindAllString(string(b), -1)
	namestrsing := namestr[0][:len(namestr[0])-2]
	var newall []byte

	if len(oldtoolbox) == 1 && len(oldslider) == 1 { //if we only have one result, edit the html
		newtoolbox := oldtoolbox[0][:len(oldtoolbox[0])-3] + `,"readOnly":true}}}`
		newslider := oldslider[0][:len(oldslider[0])-2] + `,handleColor: '#eb8146',textStyle:{color:"#ffffff"},dataBackground:{lineStyle:{color:"#ffffff"},areaStyle:{color:"#ffffff"}}}]`

		newall = reptoolb.ReplaceAll(b, []byte(newtoolbox))
		newall = fixslidercolors.ReplaceAll(newall, []byte(newslider))
		newall = fixtitle.ReplaceAll(newall, []byte(`<title>River Discharge</title>`))
		//fix resizes
		newall = htmlresize.ReplaceAll(newall, []byte(`<html style="width: 100%;height:100%;">`))
		newall = bodyresize.ReplaceAll(newall, []byte(`<body style="width: 100%;height:100%;">`))
		newall = contresize.ReplaceAll(newall, []byte(`<div class="container" style="width: 100%;height:100%;bottom:2%">`))

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
