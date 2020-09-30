#####  Written By: Nicholas VanCise

![](https://github.com/thenick775/terbine_visualizations/blob/master/strainmeter_vis/graphics/demo.png)

How to operate:
-Click anywhere on the chart to start/pause the animation
-Use the text entry and `Set Playback` button to control the playback speed
-Use the starting position button to quickly switch between the beginning of the measurements and 
 a little over halfway through the year to quickly see how strain has changed between these periods
-Use the drop down menu to choose which strainmeter is displayed in the chart


This visualization is an interactive collection of horizon charts that describe the measurements made by the 4 gauges of a strainmeter. 
A strainmeter is a complex set of sensors that measure very miniscule changes in the diameter of the borehole surrounding it.

These horizon charts are a modified line graph that is split into color bands on a uniform interval along the y axis, and is then
collapsed on itself so that all values point in the positive direction.

The three strainmeters featured here are located across the middle and southern portion of California,
and are part of the network used to analyze the three-dimensional strain field in the western United States.

![](https://github.com/thenick775/terbine_visualizations/blob/master/strainmeter_vis/graphics/all_stations_on_map.png)

The four sensors (ch0-ch3) that compose each strainmeter are oriented at set angles radially in the strainmeter casing on top of each other,
and measure the changes in the borehole diameter on their respective axis.

The sensor measurements in raw form are expressed as digital counts, which are converted to units of linear microstrain with respect to
a fixed raw datapoint.

These microstrain values represent the extensional strain outwards (positive values) and compressional strain inwards (negative values)
of the borehole along the individual sensors axis. In other words, these values represent the deformation per unit length of the borehole
diameter at a resolution of 4 picometers (1 trillionth of a meter).

The horizon charts here are each color coded such that blue to purple shades represent increasing negative strain values, and orange to red
shades represent increasing positive strain values, with a white background as the starting point.

The measurements displayed in the horizon charts are also scaled respective to the minimum and maximum values reported by the gauge it represents,
so that small variations in the data can be visualized as well as large variations between different gauges within the same strainmeter.

Sensors and data such as this allow scientists and engineers to measure the imperceptible deformation of the earth over time.
This provides better insight into how the earth is moving in response to short term seismic events and at scale over time, along 
with demonstrating how seismic and postseismic movement can be analyzed and used to enhance earthquake early warning systems.
 
Original lines graphs of data available [here](https://github.com/thenick775/terbine_visualizations/tree/master/strainmeter_vis/graphics)

Raw data is available within the [src directory](https://github.com/thenick775/terbine_visualizations/tree/master/strainmeter_vis/src/strainmeterhorizonchart)

Data Sources:

(Continuous data): feed: Borehole Strain / Jack Canyon Road, Parkfield, California, United States / 2016 guid: 68ddc187-0e09-4eaa-8eac-b5aebe349023

(Continuous data): feed: Borehole Strain / Volcanic Trail, Orinda, California, United States / 2016 guid: 95e4fc58-8d87-43f8-b96b-121009db3f4f

(Continuous data): feed: Borehole Strain / Asbestos Mountain, Riverside County, California, United States / 2016 guid: 702057bb-c641-4e02-ae71-ee88d5d49eae

Technologies Used:

Javascript

d3.js

Matplotlib

Jupyter-Notebook



Extra reading material:

[What is a strainmeter?](https://www.unavco.org/instrumentation/geophysical/borehole/bsm/bsm.html) courtesy of UNAVCO

[What is a horizon chart?](https://flowingdata.com/2015/07/02/changing-price-of-food-items-and-horizon-graphs/)

