    function ParseData(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var day = date.getDate();
        var month = dategetMonth();
        var year = date.getFullYear();
        return day + "." + month + "." + year + " " + hours + ":" + minutes + ":" + seconds;
    }


  function CalcTime(min){
	var i=min;
	var result=[];
	do{
	if ((i%5)===0) {
		result.start=min;
		result.end=i;
		result.diff=i-min;
		if (result.diff>=1) {
			return result;
		}
    }
      i+=1;
    }
	while (i<60);
	
  }



$( document ).ready(function() {
  
  curent_unix=Math.floor(Date.now()/1000);
  curent_time = new Date((curent_unix*1000));
  minuts=curent_time.getMinutes();  
  intervals=CalcTime(minuts);
  $("p#curent_unix").text(curent_unix);
  $("p#curent_time").text(minuts);
  $("p#curent_stoptime").text("start= " + intervals.start + " end= " + intervals.end + " diff= " + intervals.diff);
  planedStart=new Date(curent_time.getFullYear(),curent_time.getMonth(),curent_time.getDate(),curent_time.getHours(),curent_time.getMinutes(),curent_time.getSeconds());
  planedEnd=new Date(curent_time.getFullYear(),curent_time.getMonth(),curent_time.getDate(),curent_time.getHours(),intervals.end);
  planedEnd2= "year=" + curent_time.getFullYear()+ "month=" + curent_time.getMonth() + "day=" + curent_time.getDate() + "hours=" + curent_time.getHours() + "minutes=" + intervals.end + "seconds=" + curent_time.getSeconds();
  $("p#curent_starttime").text(planedStart);
  $("p#curent_endtime").text(planedEnd);
});