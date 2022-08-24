import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Dropdown from "assets/dropDown";

export default function RacerBar(clientColor){
	let width = 1152;
	let height = 380;
	const ref = useRef()
	const [animationEnabled, setAnimationEnabled] = useState(false);
	const [animLabel, setAnimLabel] = useState(null)
	const [selectedIndicator, setSelectedIndicator] = useState("item1");
	const [isFetched, setIsFetched] = useState(false);
	const [data, setData] = useState([{}]);;
	const [init, setInit] = useState(false);
	const [iter, setIter] = useState(0);
	var svg;
	var ticker;
	
	const dropDownItems = [
		 {key:'1', label: 'item1', value: 'Item1'},
		 {key:'2', label: 'item2', value: 'Item2'},
		 {key:'3', label: 'item3', value: 'Item3'},
		 {key:'4', label: 'item4', value: 'Item4'},
		 {key:'5', label: 'item5', value: 'Item5'},
		 {key:'6', label: 'item6', value: 'Item6'}
	];
	
	
	async function plotChart(data, svg) {
		
		const fontSize = 16;
		const rectProperties = {height: 20, padding: 10}
		const container = svg.append("g")
								.classed("container", true)
								.style("transform", "translateY(25px)")


		const widthScale = d3.scaleLinear()
		const axisTop = svg
						.append('g')
						.classed('axis', true)
						.style("transform", "translate(10px, 20px)")
						.call(d3.axisTop(widthScale))
	}
	
	
	const update = (date, ticker) =>  {
		setAnimLabel(date);
		const fontSize = 16;
		const rectProperties = {height: 20, padding: 10}
		const presentData = [];
		for (var i=0; i < data.length; i++){
			if (data[i].year === date){
				var key=data[i].client;
				var value = data[i][selectedIndicator]
				presentData.push({"key": key, "value": value})
			}
		}
		svg = d3.select(ref.current)
		const container = svg.select("g:nth-child(1)");
		const widthScale = d3.scaleLinear()
		
		widthScale.domain([0, d3.max(Object.values(presentData), d => d.value)])
				  .range([0, width - fontSize - 50])
		
		const axisTop = d3.selectAll("[class$='axis']")
		axisTop                
			.transition()
			.duration(ticker / 1.2)
			.ease(d3.easeLinear)
			.call(d3.axisTop(widthScale))

		const sortedRange = [...presentData].sort((a,b) => b.value - a.value)

		container
			.selectAll("text")
			.data(presentData)
			.enter()
			.append("text")

		container
			.selectAll("text")
			.text(d => d.key + " "+ d.value)
			.transition()
			.duration(ticker/1.2)
			.ease(d3.easeLinear)
			.attr("x", d => widthScale(d.value) + fontSize)
			.attr("y", (d,i) => sortedRange.findIndex(e => e.key === d.key) * (rectProperties.height + rectProperties.padding) + fontSize) 

		container
			.selectAll("rect")
			.data(presentData)
			.enter()
			.append("rect")

		container
			.selectAll("rect")
			.attr("x", 10)
			.transition()
			.duration(ticker/1.2)
			.ease(d3.easeLinear)
			.attr("y", (d,i) => sortedRange.findIndex(e => e.key === d.key) * (rectProperties.height + rectProperties.padding))
			.attr("width", d => d.value <= 0 ? 0 : widthScale(d.value))
			.attr("height", 20)
			.style("fill",   d => clientColor.clientColor.client_colors_rgb[d.key])
		
	}
	
	useEffect(()=>{
		const fetchData = async () => {
			await fetch("/api/chart04").then(
				res => res.json())
					.then((data) => {
						setData(data)
						setIsFetched(true)
					})
		}
		fetchData()
	},[])
	
	useEffect(()=>{
		if (isFetched) {
			const names = new Set(data.map(d => d.client))
			const datavalues = Array.from(d3.rollup(data, ([d]) => d[selectedIndicator], d => +d.year, d => d.client))
			svg = d3.select(ref.current)
			svg.selectAll("*").remove()
			const width = svg.node().clientWidth;
			const height = svg.node().clientHeight;
			setInit(true)
		}		
	},[isFetched])
	
	
	useEffect(()=>{
		if (init) {
			svg = d3.select(ref.current)
			plotChart(data, svg)
			const dateList = new Set(data.map(d=>d.year));
			update(Array.from(dateList)[iter], 500)
		}
	},[init, selectedIndicator])
	
	
	useEffect(() => {
        if (animationEnabled) {
			const dateList = new Set(data.map(d=>d.year));
			var date;
            const barInterval = setInterval(() => {
				if (iter < dateList.size-1){
					date = Array.from(dateList)[iter+1]
					update(date, 2500)
					setIter(iter+1);
				}
				else {
					clearInterval(barInterval);
				}
            }, (iter==0) ? 0 : 2500);
            return () => clearInterval(barInterval);
        }
    }, [animationEnabled, iter])
	
	const handleIndicatorChange = (event) => {
		setSelectedIndicator(event.target.value);
	}
	
	const hangleClick = async () => {
		const dateList = new Set(data.map(d=>d.year));
		update(Array.from(dateList)[0], 100)
		setTimeout(() => {
			setIter(0);
		}, 500);
	}
	
	return (
		<div className="RacerBar">
			<Grid container spacing={2}>
				<Grid item xs={6}>
					<Dropdown label="Please choose"
						options={dropDownItems}
						value={selectedIndicator}
						onChange={handleIndicatorChange}/>
				</Grid>
				<Grid item xs={12}>
					<div className="container">
						<svg
							ref={ref}  
							style={{width: parseInt(width, 10) || 1000, 
								height: parseInt(height, 10) || 1000}}
							id={`racerbar_chart`}
						/>
					</div>
				</Grid>
				<Grid item xs={2}>
					 <Button
						onClick={() => { setAnimationEnabled(!animationEnabled) }}>
							{animationEnabled ? "Pause" : "Play"}
					</Button>
				</Grid>
				<Grid item xs={2}>
					<Button onClick={ hangleClick }>Restart</Button>
				</Grid>
				<Grid item xs={6}>
				</Grid>
				<Grid item xs={2}>
					<div>{animLabel}</div>
				</Grid>
			</Grid>
		</div>
	)
}
