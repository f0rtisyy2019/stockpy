function buildMetadata(sample) {
  var url = "/metadata/" + sample;
  d3.json(url).then(function(response){
    var container = d3.select("#sample-metadata");
    container.html("");
    Object.entries(response).forEach(([key, value]) => {
      if (key != "WFREQ") {
        container.append("div").text(key + ": " + value);
      }
    });
  });
}

function buildCharts(sample) {
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
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    console.log(firstSample);
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();

var stocks = new Stocks('JY722LVZCMDBOJ9S');
const getData = async function(symb, intval, amount) {
  var result = await stocks.timeSeries({
    symbol: symb,
    interval: intval,
    amount: amount
  });
  console.log(result);
}
getData('TSLA', 'daily', 365);


// console.log(result);
