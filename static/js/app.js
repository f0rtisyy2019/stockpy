function buildCharts(symbol) {
  var stocks = new Stocks('JY722LVZCMDBOJ9S');
  const getData = async function(symb, interval, amount) {
    const result = await stocks.timeSeries({
      symbol: symb,
      interval: interval,
      amount: amount
    });

    // meta data
    var container = d3.select("#symbol-metadata");
    container.html("");
    Object.entries(result[0]).forEach(([key, value]) => 
      container.append("div").text(key + ": " + value)
    );

    // line chart
    var trace1 = {
      x: result.map(d => d.date),
      y: result.map(d => d.open),
      mode: "lines",
      name: "open",
    };
    var trace2 = {
      x: result.map(d => d.date),
      y: result.map(d => d.high),
      mode: "lines",
      name: "high",
    };
    var trace3 = {
      x: result.map(d => d.date),
      y: result.map(d => d.low),
      mode: "lines",
      name: "low",
    };
    var trace4 = {
      x: result.map(d => d.date),
      y: result.map(d => d.close),
      mode: "lines",
      name: "close",
    };
    var stockData = [trace1, trace2, trace3, trace4];
    var layout = {
      title: `Ticker prices for ${symbol} `,
    };
    Plotly.newPlot('stock_1', stockData, layout);

  }
  getData(symbol, 'daily', 365);
}

function gainVsLose() {
  d3.json("/scrape").then(function(response){
    const display = ['Symbol', 'Price (Intraday)', 'Change', '% Change'];
    const filtered = response.Stocks.map(raw => {
      return Object.keys(raw)
        .filter(key => display.includes(key))
        .reduce((obj, key) => {
          obj[key] = raw[key];
          return obj;
        }, {});
    });
    
    const gainers = filtered.slice(0,3);
    const losers = filtered.slice(3);

    // gainers table
    var gainerTable = d3.select('#stocks_gainers').append('table').attr("class", "table");
    gainerTable.append('thead').append('tr')
      .selectAll('th')
      .data(display).enter()
      .append('th')
      .text(d => d);
		var rows = gainerTable.append('tbody').selectAll('tr')
      .data(gainers).enter()
      .append('tr');
    rows.selectAll('td')
        .data(function(row) {
          return display.map(column => {
            return { column: column, value: row[column] };
          });
        })
        .enter()
		    .append('td')
		    .text(d=>d.value);

    // losers table
    var loserTable = d3.select('#stocks_losers').append('table').attr("class", "table");
    loserTable.append('thead').append('tr')
      .selectAll('th')
      .data(display).enter()
      .append('th')
      .text(d => d);
    var rows = loserTable.append('tbody').selectAll('tr')
      .data(losers).enter()
      .append('tr');
    rows.selectAll('td')
      .data(function (row) {
        return display.map(column => {
          return { column: column, value: row[column] };
        });
      })
      .enter()
      .append('td')
      .text(d => d.value);
   
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
  });
  gainVsLose();
}

function optionChanged(symbol) {
  // Fetch new data each time a new sample is selected
  buildCharts(symbol);
}

// Initialize the dashboard
init();
