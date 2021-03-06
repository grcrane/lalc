/* ----------------------------------------------------------- */
/* Get the requested data                                      */
/* Called from various places to fetch Google Sheets data      */
/* ----------------------------------------------------------- */

function getAjaxData(theurl) {
  var result="";

  jQuery.ajax({
    url: theurl,
    dataType: 'text',
    async: false,  
    success:function(data) {
      i = data.indexOf('(');
    j = data.lastIndexOf(')');
    data = data.substr(i+1,j-1-i);
    var data = JSON.parse(data);
    var data = data.table.rows;
       result = data; 
    }
 });
 return result;
}

/* ----------------------------------------------------------- */
/* Initialize                                                  */
/* ----------------------------------------------------------- */

var list = [];
var dataarray = [];
var retlist = [];
var service_data = [];
var file_id = '1JSsbzbMY07vZzVO_u3E8wu7JOJruiQt7wXmo4LV_ALQ';
var preachlist = [];
var datelist = [];
var thedate = '';
var prevyear = '';
var str = '';



  
function fillServiceList(showpreacher) {
  console.log('datelist=' + datelist.length);
  jQuery('#serviceList').empty();
  str = '';
  var testlist = datelist;
  if (showpreacher && showpreacher != '') { 
    testlist = datelist.filter(function(e) {
      return e.c[1].v == showpreacher;
    })
  }

  var prevdate = ''; 
  testlist.forEach(function(item, key) {
    if (item.c[0] != null) {
      if (item.c[0].v != prevdate) { // skip if duplicate date 
        var thedate = eval("new " + item.c[0].v);
        var preacher = item.c[1].v;
        if (showpreacher == null || showpreacher == '' || showpreacher == preacher) {
        var year = thedate.getFullYear();
          if (prevyear != year) {
            if (!prevyear) { str += '</ul></li>';}
            prevyear = year;
            str += "</ul></li><li class='liYear'><div>" + year + "</div><ul>";
          }
          str += '<li><a href="#" class=showdate data-date="' + year + '-' + 
            thedate.getMonth() + '-' + thedate.getDate() + 
            '" data-preacher="' + preacher + '" >' 
            + thedate.toString().substr(0,15) + '</a></li>';
        }
      }
      prevdate = item.c[0].v; 
    }
  })

  jQuery(str).appendTo('#serviceList');
  jQuery("#serviceList > li > div").unbind('click');
  jQuery("#serviceList > li > div").click(function(){
    if (jQuery(this).next().is(":visible")) {
      jQuery(this).next().slideUp();
    }
    else {
      jQuery('#serviceList ul').slideUp();
      //jQuery(this).next().addClass('activelist');
      jQuery(this).next().slideDown();
    }
  });
  jQuery('#serviceList ul:eq(0)').slideDown();

  /* ----------------------------------------------------------- */
  /* Open the service details block on click of date             */
  /* ----------------------------------------------------------- */

  jQuery(".showdate").unbind('click');
  jQuery(".showdate").click(function(e) {

    jQuery('#details').css('display','block');
    jQuery('#yearsList').css('display','none');
    e.preventDefault();
    var dateText = jQuery(this).data('date');
    var a = dateText.split('-');
    var query =  "SELECT * WHERE YEAR(A) = " + a[0] + " AND MONTH(A) = " +
        a[1] + " AND DAY(A) = " + a[2] + " ORDER BY B, C";
    var url = 'https://docs.google.com/spreadsheets/u/0/d/' 
      + file_id + '/gviz/tq?tqx=&sheet=audio&tq=' + escape(query);
    var daylist = getAjaxData(url);

    var url = 'https://docs.google.com/spreadsheets/u/0/d/' 
      + file_id + '/gviz/tq?tqx=&sheet=bulletin&tq=' + escape(query);
    var bulllist = getAjaxData(url);
    var bulllink = '';
    if (bulllist[0].c[3] != null) {
      bulllink = '<a href="https://drive.google.com/file/d/' + bulllist[0].c[3].v + 
        '/view?usp=sharing" target="_new">Service Bulletin</a>';
    }

    var str = '';
    jQuery("#audioPlayers").html('');
    var title = '';
    var preacher = '';
    var speaker = ''; 
    var prevServiceTitle = ''; 
    var serviceTitle = '';  // 10am
    daylist.forEach(function(item, key) {
      var src = 'https://drive.google.com/uc?export=download&id=' + item.c[7].v;
      var down = 'https://drive.google.com/uc?authuser=0&id=' + item.c[7].v + '&export=download';
      if (item.c[3] != null) { title = item.c[3].v;}
      if (item.c[5] != null) { preacher = item.c[5].v;} // preacher
      if (item.c[6] != null) { speaker = item.c[6].v;} // speaker
      serviceTime = '';
      if (item.c[1] != null) {serviceTime = item.c[1].v} 
      serviceTitle = serviceTime + title; 
      if (serviceTitle != prevServiceTitle) {
        jQuery('<h1 class="detailsTime">' + title + '</div>').appendTo("#audioPlayers");
        jQuery('<span class="detailsPreacher">Presiding: ' + preacher + '</span>').appendTo("#audioPlayers");
        prevServiceTitle = serviceTitle; 
      }
      if (item.c[3] != null) {
        var caption = item.c[4].v;
        if (speaker) {caption = caption + " (" + speaker + ")";}
        jQuery('figure.template').eq(0).clone().appendTo("#audioPlayers")
          .css('display','block')
          .removeClass('template')
          .find('figcaption').html(caption)
          .parent().find('audio').attr('title',item.c[3].v).find('source').attr('src',src)
          .parent().parent().find('a.figDownload').attr('href',down);
      }
    })
    jQuery("#detailsBull").html(bulllink);
  });

}

jQuery( document ).ready(function() {

  //Get a list of preachers for the dropdown
var query = 'SELECT F, count(A) GROUP BY F ORDER BY F DESC'
var url = 'https://docs.google.com/spreadsheets/u/0/d/' 
  + file_id + '/gviz/tq?tqx=&sheet=audio&tq=' + escape(query);
preachlist = getAjaxData(url);

//Get a list of available audio recordings   
//var query = 'SELECT A, F, count(A) WHERE F IS NOT NULL GROUP BY A, F ORDER BY A DESC'
var query = 'SELECT A, F, count(A) WHERE F IS NOT NULL ' +
 'GROUP BY A, F ORDER BY A DESC'
var url = 'https://docs.google.com/spreadsheets/u/0/d/' 
  + file_id + '/gviz/tq?tqx=&sheet=audio&tq=' + escape(query);
datelist = getAjaxData(url);


thedate = eval("new " + datelist[0].c[0].v);

  // Hide the template audio figure
  jQuery('figure').eq(0).addClass('template');

  // Fill the preacher dropdown box
  var sermonby = '';
  var options = "<option value=''>All Preachers</option>";
  preachlist.forEach(function(item, key) {
      var selected = '';
      if (item.c[0] != null) {
          if (item.c[0].v == sermonby) {
              selected = ' selected ';
          }
          options += "<option value = '" + item.c[0].v + "'" +
          selected + ">" + item.c[0].v + " (" + item.c[1].v + ")</option>";
      }
  })
  jQuery('#selectOptions select#sermonby').append(options);

  // Populate the service dates
  fillServiceList(null);

  // Flop between service list and details display
  jQuery('#closeDetails').click( function(e) {
    e.preventDefault(); 
    jQuery('#details').css('display','none');
    jQuery('#yearsList').css('display','block');
  });

  jQuery('#sermonby').on('change',function(e) {
    fillServiceList(jQuery(this).val());
  })

  jQuery('#loading').css('display','none');
  jQuery('#yearsList').css('display','block');

});