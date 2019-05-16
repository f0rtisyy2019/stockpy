function buildMetadata(symbol) {
  var stocks = new Stocks('JY722LVZCMDBOJ9S');
  var result;
  const getData = async function(symb, interval, amount) {
    result = await stocks.timeSeries({
      symbol: symb,
      interval: interval,
      amount: amount
    });
    var container = d3.select("#symbol-metadata");
    container.html("");
    Object.entries(result[0]).forEach(([key, value]) => 
      container.append("div").text(key + ": " + value)
    );
  }
  getData(symbol, 'daily', 365);
}

function gainVsLose() {
  d3.json("/scrape").then(function(response){
    const rawData = response.Stocks;
    console.log(rawData);
    const allowed = ['Symbol', 'Last Price', 'Change', '% Change'];
    rawData.map(raw => {
      return Object.keys(raw)
        .filter(key => allowed.includes(key))
        .reduce((obj, key) => {
          obj[key] = raw[key];
          return obj;
        }, {});
    });
    
    
    console.log(rawData);
    return;
    gainers = response.Stocks.slice(0,3);
    losers = response.Stocks.slice(3);
    tableHead = ['Symbol', 'Last Price', 'Change', '% Change'];

    var gainerTable = d3.select('#stocks_gainers').append('table');
    gainerTable.append('thead').append('tr')
                .selectAll('th')
                .data(tableHead).enter()
                .append('th')
                .text(function (d) {
                  return d;
                });
		var rows = gainerTable.append('tbody').selectAll('tr')
		               .data(gainers).enter()
		               .append('tr');
		rows.selectAll('td')
        .enter()
		    .append('td')
		    .attr('data-th', function (d) {
		    	return d.name;
		    })
		    .text(function (d) {
		    	return d.value;
		    });
   
  });
}

function buildCharts(sample) {
  return '';
  var url = "/samples/" + sample;
  d3.json(url).then(function(response){
    var data = Object.values(response)[0].map(() => {return {}});
    Object.keys(response).map(key => {
      for (let i = 0; i < Object.values(response)[0].length; i++) {
        data[i][key] = response[key][i];
      }
    });
    var top10 = data.sort((a,b) => b.sample_values - a.sample_values).slice(0,10);

    var labels = [];
    var values = [];
    var text = [];
    top10.forEach(ele => {
      labels.push(ele.otu_ids);
      values.push(ele.sample_values);
      text.push(ele.otu_labels);
    });

    pieData = [{
      "labels": labels,
      "values": values,
      "text": text,
      "type": "pie",
      "textinfo": 'percent'
    }];
    // Plotly.newPlot("pie", pieData);

    // bubble chart
    var trace1 = {
      x: response.otu_ids,
      y: response.sample_values,
      text: response.otu_labels,
      mode: 'markers',
      marker: {
        size: response.sample_values,
        color: response.otu_ids.map(x=> "#" + Number(x).toString(16))
      }
    };
    var bubbleData = [trace1];
    // Plotly.newPlot('bubble', bubbleData);
    
  });

}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/ticker").then((symbol) => {
    symbol.forEach((data) => {
      selector
        .append("option")
        .text(data)
        .property("value", data);
    });

    // Use the first sample from the list to build the initial plots
    const firstSymbol = symbol[0];
    buildCharts(firstSymbol);
    buildMetadata(firstSymbol);
  });
  gainVsLose();
}

function optionChanged(symbol) {
  // Fetch new data each time a new sample is selected
  buildCharts(symbol);
  buildMetadata(symbol);
}

// Initialize the dashboard
init();
