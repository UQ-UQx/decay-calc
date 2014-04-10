var isotopes = Array();

isotopes['C-11'] = new Array('0.3398', 'Carbon-11');
isotopes['N-13'] = new Array('0.1662', 'Nitrogen-11');
isotopes['F-18'] = new Array('1.833', 'Fluorine-18');

isotopes['Cu-64']  = new Array('12.7', 'Copper-64');

isotopes['Ga-67']  = new Array('78.2808', 'Gallium-67');
isotopes['Ga-68']  = new Array('1.1285', 'Gallium-68');

isotopes['Zr-89']  = new Array('78.41', 'Zirconium-89');

isotopes['Tc-99m'] = new Array('6.007', 'Technetium-99m');

isotopes['In-111'] = new Array('67.2', 'Indium-111');

isotopes['I-123']  = new Array('13.22', 'Iodine-123');
isotopes['I-124']  = new Array('100.3', 'Iodine-124');

isotopes['Tl-201'] = new Array('72.9', 'Thallium-201');

$(function() {
  var refDateStr = '';
  var useDateStr = '';
  var refTimeStr = '';
  var useTimeStr = '';
  var refDateTimeStamp = 0;
  var useDateTimeStamp = 0;
  var durationMin = false;
  var durationHr = false;
  var refAmount = false;
  var radioactivity = false;
  var refUnit = 'MBq';
  var useUnit = 'MBq';
  var halfLife = '';

  $('#chart-container').hide();

  for (var key in isotopes) {
    $('#isotope-select').append('<option value="' + key + '">' + key + '</option>');
  }

  $('#show-calc-button').addClass('selected');

  $('#show-calc-button').click(function() {
    $('#calc-container').show();
    $('#chart-container').hide();
    $(this).addClass('selected');
    $('#show-chart-button').removeClass('selected');
  });

  $('#show-chart-button').click(function() {
    $('#calc-container').hide();
    $('#chart-container').show();
    if (refUnit === 'uCi') {
      doFlotPlot(0.037 * refAmount, halfLife, durationHr);
    }
    else {
      doFlotPlot(refAmount, halfLife, durationHr);
    }
    $(this).addClass('selected');
    $('#show-calc-button').removeClass('selected');
  });

  $('#amount-units').change(function() {
    refUnit = $(this).val();
    calculateRadioactivity();
  });
  
  $('#display-units').change(function() {
    useUnit = $(this).val();
    calculateRadioactivity();
  });

  // Use HTML5 date and time pickers if mobile device.
  if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)) {
    $('#duration-container').append(
      '<input type="date" id="reference-date-input"></input>' +
      '<input type="date" id="use-date-input"></input>' +
      '<input type="time" id="reference-time-input"></input>' +
      '<input type="time" id="use-time-input"></input>'
    );
    
    $('#reference-date-input').change(function() {
      refDateStr = $(this).val();
      refDateTimeStamp = getRefDateTimeStamp();
      $('#duration').html('Specify a valid D<sub>1</sub> and D<sub>2</sub>');
      clearDisplay();
      calculateDuration();
      calculateRadioactivity();
    });

    $('#use-date-input').change(function() {
      useDateStr = $(this).val();
      useDateTimeStamp = getUseDateTimeStamp();
      $('#duration').html('Specify a valid D<sub>1</sub> and D<sub>2</sub>');
      clearDisplay();
      calculateDuration();
      calculateRadioactivity();
    });

    $('#reference-time-input').change(function() {
      refTimeStr = $(this).val();
      refDateTimeStamp = getRefDateTimeStamp();
      $('#duration').html('Specify a valid D<sub>1</sub> and D<sub>2</sub>');
      clearDisplay();
      calculateDuration();
      calculateRadioactivity();
    });

    $('#use-time-input').change(function() {
      useTimeStr = $(this).val();
      useDateTimeStamp = getUseDateTimeStamp();
      $('#duration').html('Specify a valid D<sub>1</sub> and D<sub>2</sub>');
      clearDisplay();
      calculateDuration();
      calculateRadioactivity();
    });
  }
  // Use JQuery UI datepicker and timepicker plugin if not mobile.
  else {
    $('#duration-container').append(
      '<input type="text" id="reference-date-input"></input>' +
      '<input type="text" id="use-date-input"></input>' +
      '<input type="text" id="reference-time-input"></input>' +
      '<input type="text" id="use-time-input"></input>'
    );

    $('#reference-date-input').datepicker({
      dateFormat: 'dd/mm/yy',
      onSelect: function(dateText) {
        refDateStr = dateText;
        if ($.trim(refTimeStr) === '') {
          $('#reference-time-input').val('12:00');
          refTimeStr = '12:00';
        }
        refDateTimeStamp = getRefDateTimeStamp();
        $('#duration').html('Specify a valid D<sub>1</sub> and D<sub>2</sub>');
        clearDisplay();
        calculateDuration();
        calculateRadioactivity();
      }
    }).attr('readonly', true);

    // Required due to buggy interaction between datepicker and selectbox.
    /*$(document).click(function (e) {
      var target = e.target;
      if (!$(target).is('#reference-date-input') &&
          !$(target).is('#ui-datepicker-div') &&
          !$(target).is('.ui-datepicker-next') &&
          !$(target).is('.ui-datepicker-prev')) {
        $('#reference-date-input').datepicker('hide');
      }
      if (!$(target).is('#use-date-input') &&
          !$(target).is('#ui-datepicker-div') &&
          !$(target).is('.ui-datepicker-next') &&
          !$(target).is('.ui-datepicker-prev')) {
        $('#use-date-input').datepicker('hide');
      }
    }); */
    
    $('#use-date-input').datepicker({
      dateFormat: 'dd/mm/yy',
      onSelect: function(dateText) {
        useDateStr = dateText;
        if ($.trim(useTimeStr) === '') {
          $('#use-time-input').val('12:00');
          useTimeStr = '12:00';
        }
        useDateTimeStamp = getUseDateTimeStamp();
        $('#duration').html('Specify a valid D<sub>1</sub> and D<sub>2</sub>');
        clearDisplay();
        calculateDuration();
        calculateRadioactivity();
      }
    }).attr('readonly', true);

    $('#reference-time-input').timeEntry({spinnerImage: '', show24Hours: true}).change(function() {
      refTimeStr = $(this).val();
      refDateTimeStamp = getRefDateTimeStamp();
      $('#duration').html('Specify a valid D<sub>1</sub> and D<sub>2</sub>');
      clearDisplay();
      calculateDuration();
      calculateRadioactivity();
    });

    $('#use-time-input').timeEntry({spinnerImage: '', show24Hours: true}).change(function() {
      useTimeStr = $(this).val();
      useDateTimeStamp = getUseDateTimeStamp();
      $('#duration').html('Specify a valid D<sub>1</sub> and D<sub>2</sub>');
      clearDisplay();
      calculateDuration();
      calculateRadioactivity();
    });
  }

  $('#isotope-select').change(function() {
    var selectedIsotope = $(this).val();
    if (selectedIsotope !== 'Select') {
      halfLife = isotopes[$(this).val()][0];
      $('#isotope-halflife').html(halfLife + ' h');
      calculateRadioactivity();
    }
    else {
      halfLife = '';
      $('#isotope-halflife').html('Select an isotope');
      clearDisplay();
    }
  });

  $('#amount-units').change(function() {
    refUnit = $(this).val();
    calculateRadioactivity();
  });

  $('#display-units').change(function() {
    useUnit = $(this).val();
    calculateRadioactivity();
  });
  
  $('#amount-input').change(function() {
    if (isNumber($(this).val())) {
      refAmount = parseFloat($(this).val());
      calculateRadioactivity();
    }
    else {
      refAmount = false;
      clearDisplay();
    }
  });

  function getRefDateTimeStamp() {
    if ((refDateStr !== '') && (refTimeStr !== '')) {
      var refAUDate = Date.parse(refDateStr).toString('d/M/yyyy');

      if (refAUDate !== null) {
        var refDateTime = Date.parse(refAUDate + ' ' + refTimeStr);

        if (refDateTime !== null) {
          return refDateTime.getTime();
        }
      }
    }

    return 0;
  }

  function getUseDateTimeStamp() {
    if ((useDateStr !== '') && (useTimeStr !== '')) {
      var useAUDate = Date.parse(useDateStr).toString('d/M/yyyy');

      if (useAUDate !== null) {
        var useDateTime = Date.parse(useAUDate + ' ' + useTimeStr);

        if (useDateTime !== null) {
          return useDateTime.getTime();
        }
      }
    }

    return 0;
  }

  function calculateDuration() {
    if (refDateTimeStamp !== 0 && useDateTimeStamp !== 0) {
      durationMin = ((useDateTimeStamp - refDateTimeStamp) / 60000);
      durationHr = ((useDateTimeStamp - refDateTimeStamp) / 3600000);

      $('#duration').html(roundTwoDec(durationHr) + ' h<br><br>' + roundTwoDec(durationMin) + ' min');
    }
    else {
      durationMin = false;
      durationHr = false;
    }
  }

  function calculateRadioactivity() {
    if (durationHr !== false && halfLife !== '' && refAmount !== false) {
      var result = computeDecay(refAmount, halfLife, durationHr);

      if (refUnit === 'MBq' && useUnit === 'uCi') {
        result = 27.027 * result;
      }
      else if (refUnit === 'uCi' && useUnit === 'MBq') {
        result = 0.037 * result;
      }

      radioactivity = result;
      $('#display-amount').html(calcFormatDisplay(result, 9));
    }
    else {
      clearDisplay();
      radioactivity = false;
    }
  }

  function doFlotPlot (amount, halflife, duration) {
    var dataRow = [];
    var pointRow = [];
    var step = 10;
    var bottomTicks = [];
    var i = 0, j = 0;
    var plotOptions = {};
    var ticksTop = [];
    var skip = 0;
    var skipCount = 0;

    switch(true) {
      case (Math.abs(duration) < 10): 
        step = 0.5;
        break;
      case (Math.abs(duration) < 100):
        step = 10;
        break;
      case (Math.abs(duration) < 200):
        step = 24;
        break;
      default:
        step = Math.ceil(Math.abs(duration) / 24);
    };

    while ((Math.abs(duration) / ((skip + 1) * step)) > 7) {
      skip++;
    }

    skipCount = skip;

    for (i = 0; i <= (Math.abs(duration) + step); i += step) {
      if (duration >= 0) {
        // Make rounder curves.
        for (j = i; j < i + step; j += step / 10) {
          dataRow.push([j, computeDecay(amount, Number(halflife), j)]);
        }

        if (skipCount === skip) {
          pointRow.push([i, computeDecay(amount, Number(halflife), i)]);
          bottomTicks.push([i, '<small>'+ calcFormatDisplay(i, 6) + ' h</small>']);
          skipCount = 0;
        }
        else {
          skipCount++;
        }
      }
      else {
        // Make rounder curves.
        for (j = duration + i; j < (duration + i + step); j += step / 10) {
          dataRow.push([j, computeDecay(amount, Number(halflife), j)]);
        }

        if (skipCount === skip) {
          pointRow.push([duration + i, computeDecay(amount, Number(halflife), duration + i)]);
          bottomTicks.push([i + duration, '<small>'+ calcFormatDisplay(duration + i, 6) + ' h</small>']);
          skipCount = 0;
        }
        else {
          skipCount++;
        }
      }
    }

    // Calc line-weight (depending on duration/scale) for vert line on upper axis
    var lineWidth = 1 / ( 2 * (100 / Math.abs(duration)));

	if (($.trim(refDateStr) !== '') && ($.trim(refTimeStr) !== '')) {
	  ticksTop[0] = [0, '<small><b>D<sub>1</sub></b><br>' + refDateStr + '<br>at ' + refTimeStr + '</small>'];
	}
	else {
	  ticksTop[0] = [0, ''];
	}

	if (($.trim(useDateStr) !== '') && ($.trim(useTimeStr) !== '')) {
	  ticksTop[1] = [duration, '<small><b>D<sub>2</sub></b><br>' + useDateStr + '<br>at ' + useTimeStr + '</small>'];
	}
	else {
	  ticksTop[1] = [duration, ''];
	}

    if (duration >= 0) {
      plotOptions = {
          points: {
            radius: 2,
            color: '#D9007A'
          },
          grid: { 
            hoverable: true,
            clickable: true,
            autoHighlight: true,
            markings: [{
              xaxis: {
                from: (0 - lineWidth / 2),
                to: lineWidth / 2
              },
              yaxis: {
                from: 0,
                to: 100
              },
              color: '#D9007A'
            }, {
              xaxis: {
                from: Number(Math.abs(duration) - lineWidth / 2),
                to: Number(Math.abs(duration) + lineWidth / 2)
              },
              yaxis: {
                from: 0,
                to: 100
              },
              color: '#D9007A'
            }]
          },
          crosshair: {
            mode: 'x'
          },
          colors: ['#000000'],
          xaxes: [{
            min: -2 * step,
            max: Math.abs(duration) + 2 * step,
            label: 'hours',
            ticks: bottomTicks,
            position: 'bottom',
            show: 1
          }, {
            min: -2 * step,
            max: Math.abs(duration) + 2 * step,
            position: 'top',
            ticks: ticksTop,
            tickColor: '#D9007A',
            show: true
          }],
          yaxes: [{   
            min: 0,
            max: 1,
            show: true
          }, {
            position: 'right',
            alignTicksWithAxis: 'right',
            tickFormatter: formatterMBq,
            max: amount,
            min: 0,
            color: '#000'
          }]
      };
    }
    else {
      plotOptions = {
          points: {
            radius: 2,
            color: '#D9007A'
          },
          grid: { 
            hoverable: true,
            clickable: true,
            autoHighlight: true,
            markings: [{
              xaxis: {
                from: (0 - lineWidth / 2),
                to: lineWidth / 2
              },
              yaxis: {
                from: 0,
                to: 100
              },
              color: '#D9007A'
            }, {
              xaxis: {
                from: Number(duration - lineWidth / 2),
                to: Number(duration + lineWidth / 2)
              },
              yaxis: {
                from: 0,
                to: 100
              },
              color: '#D9007A'
            }]
          },
          crosshair: {
            mode: 'x'
          },
          colors: ['#000000'],
          xaxes: [{
            min: -2 * step + duration,
            max: 2 * step,
            label: 'hours',
            ticks: bottomTicks,
            position: 'bottom',
            show: 1
          }, {
            min: -2 * step + duration,
            max: 2 * step,
            position: 'top',
            ticks: ticksTop,
            tickColor: '#D9007A',
            show: true
          }],
          yaxes: [{   
            min: 0,
            max: 1,
            show: true
          }, {
            position: 'right',
            alignTicksWithAxis: 'right',
            tickFormatter: formatterMBq,
            max: computeDecay(amount, halflife, duration),
            min: 0,
            color: '#000'
          }]
      };
    }

    // Plot the chart.
    $.plot($('#plot-holder'), [{
        data: dataRow,
        yaxis: 2,
        xaxis: 1,
        lines: {
          show: true
        },
        points: {
          show: false
        }
      }, { 
        data: pointRow,
        yaxis: 2,
        xaxis: 1,
        lines: {
          show: false
        },
        points: {
          show: true
        },
        color:'#D9007A'
      }],
      plotOptions
    );

    // Mouseover to see the radioactivity.
    var previousPoint = null;

    $('#plot-holder').bind('plothover', function (event, pos, item) {
      if (item) {
        if (previousPoint != item.dataIndex) {
          previousPoint = item.dataIndex;
          var x = calcFormatDisplay(item.datapoint[0], 9);
          var y = calcFormatDisplay(item.datapoint[1], 9);
          $('#hover-info').html(y + ' MBq at ' + x + ' h');  
        }
      }
      else {
        $('#hover-info').html('Mouseover a point to see the radioactivity');
        previousPoint = null;            
      }
    });

    showGraph();
  };

  function clearDisplay() {
    $('#display-amount').html('');
  }

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function roundTwoDec(n) {
    return (Math.round(n * 100) / 100);
  }

  function showGraph () { 
    $('#plot-holder').show();
    $('#hover-info').show();
  }

  function computeDecay(init, hl, dur) {
    return (init * Math.exp(-1.0 * (Math.log(2) / hl) * dur));
  }

  function calcFormatDisplay(v, m) {
    var displayValue = roundTwoDec(v);
    var displayText = displayValue.toString();
    var i = 4;

    while ((displayText.length > m) && (i >= 0))  {
      if (i === 4) {
        displayText = displayValue.toExponential().toString();
      }
      else {
        // Get rid of trailing zeros from numbers in exponential form.
        displayText = displayValue.toExponential(i).toString();
        displayText = parseFloat(displayText);
        displayText = displayText.toExponential().toString();
      }

      i--;
    }

    if ((displayText.length > m) || (displayText === 'Infinity')) {
      displayText = 'Error';
    }
    else if (displayText.indexOf('e+') !== -1) {
	  var displaySplit = displayText.split('e+');
	  displayText = displaySplit[0] + '&times;10<sup>' + displaySplit[1] + '</sup>';
    }
    else if (displayText.indexOf('e-') !== -1) {
	  var displaySplit = displayText.split('e');
	  displayText = displaySplit[0] + '&times;10<sup>' + displaySplit[1] + '</sup>';
	}

    return displayText;
  }
  
  function formatterMBq(v, axis) {
    return calcFormatDisplay(v, 6) + ' MBq';
  }
});