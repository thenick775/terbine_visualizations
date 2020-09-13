package main

import (
	"bufio"
	"encoding/json"
	"log"
	"os"
	"strings"
)

//struct to convert cdip data
type dat struct {
	Axis  string `json:"axis"`
	Value string `json:"value"`
}

type linerec struct {
	Datetime string `json:"datetime"`
	Data     []dat `json:"data"`
}

var labellist = []string{"SST", "DP", "HS", "TP", "TA"}

func main() {
	filer, err := os.Open("/cdipipan.csv")
	if err != nil {
		log.Fatal(err)
	}
	defer filer.Close()

	filew, err := os.Create("/cdipres.json")
	if err != nil {
		log.Fatal(err)
	}
	defer filew.Close()

	filew.Write([]byte("["))

	scanner := bufio.NewScanner(filer)
	for scanner.Scan() {
		t := scanner.Text()
		vals := strings.Split(t,",")

		var line linerec

		for i, val := range vals {
			if i == 0 {
				line.Datetime = val
			} else if i==1{
					line.Datetime+=val
			} else {
				line.Data = append(line.Data, dat{Axis: labellist[i-2], Value: val})
			}
		}

		b, err := json.Marshal(&line)
		if err != nil {
			log.Fatal(err)
		}

		filew.Write(append(b,byte(',')))
	}

	filew.Write([]byte("]")) //we leave a trailing comma, but can clean later

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}

}
