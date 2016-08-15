
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
var HandRotationInterval = 10;  //second hand rotated/updated every 10 millisecond
var degreeS = 0, degreeM = 0, degreeH = 0;  //initial rotation degree of the hands
var workDuration = 120000; //initial duration of work period
var workTimeElapsed = 0;
var breakDuration = 60000;  //initial duration of break period
var breakTimeElapsed = 0;   
var tempDuration = workDuration; //used as temp variable for workDuration and breakDuration
var tempTimeElapsed = 0;
var workPeriod = true;  //whether it's the work period
var breakPeriod = false; //whether it's the work period
var bgColor = 'white'; //color for background
var workColor = 'green'; //color to indicate break period
var breakColor = 'red'; //color to indicate break period
var fgColor = 'blue'; //color for foreground
var secColor = fgColor;  //color for second hand
var minColor = 'red'; //color for minute hand
var hrColor = 'black'; //color for hour hand
var tempColor = workColor;
var secondInterval;  //used thus: secondInterval = window.setInterval(rotateSecondHand, 1000)
var minuteInterval; //used thus: secondInterval = window.setInterval(rotateMinuteHand, 60000)
var hourInterval; //used thus: secondInterval = window.setInterval(rotateHourHand, 3600000)
var time = 0; //the system time that will be used to synchronize the clock's time


var SVG = {w:500, h:500}; //the dimensions of the SVG element
var svgOffset = 33*(SVG.w/300); //the difference in radii of circle1 and circle 2
var ep = 25; //the offset of the circle from the edge of the SVG element
var ep2 = 6*(SVG.w/300); //used as an offset for the short inter-circular dashes drawn to enclose the numbers
var fontSize = 14*(SVG.w/300);
var sWidth = 2.5 + 3*(SVG.w/300 - 1)*0.75; //the width of the clock hands i.e stroke width

/*****************************************************************************************
 * The following code defines the data structures (circles, essentially) to draw (1) the
 * outer-most arc, (2)the larger circle, (3)the smaller circle and the inner-most arc, 
 * respectively.
 *****************************************************************************************/
var svgCir0 = {x:SVG.w/2, y:SVG.h/2, r:(SVG.w/2 - ep/4) };
var svgCir1 = {x:SVG.w/2, y:SVG.h/2, r:(SVG.w/2 - ep*2) };
var svgCir2 = {x:SVG.w/2, y:SVG.h/2, r:(SVG.w/2 - ep*2 - svgOffset) };
var svgCir3 = {x:SVG.w/2, y:SVG.h/2, r:(SVG.w/2 - ep*2 - svgOffset*1.8) };


/*****************************************************************************************
 * The following code draws the paths/arches and circles in a specific order. Items drawn
 * earlier are in the background whereas items drawn later are in the foreground.
 *****************************************************************************************/

function svgNumberClock(origin)
{
    var x, y,x1,y1,x2,y2,
        theta, PI = Math.PI,
    S = '<svg width = "'+SVG.w+'" height = "'+SVG.h+'">'; //dynamically create the <svg> element and add sub-elements below

    /*********************************************************************************
    * For A(radius-x,radius-y, rotation-x, large-flag, clockwise, x-to, y-to) below,
    * the large-flag has different results when the arch is smaller than half of a
    *  circle and when it is larger than half the circle
    *********************************************************************************/                       
    S += '<path id="outerArch" d=" M'+svgCir0.x+', '+svgCir0.y+' L'+svgCir0.x+', '+(svgCir0.y-svgCir0.r)+
            ' A'+svgCir0.r+', '+svgCir0.r+' 0 0,1 '+(svgCir0.x + svgCir0.r)+', '+svgCir0.y+
            '  Z"  fill="'+workColor+'"/>';
    S +='<circle id="outerCircle" cx="'+svgCir1.x+'" cy="'+svgCir1.y+'" r="'+svgCir1.r+'" stroke="blue" stroke-width="'+sWidth+'" fill="white" />';
    S +='<circle id="innerCircle"  cx="'+svgCir2.x+'" cy="'+svgCir2.y+'" r="'+svgCir2.r+'" stroke="blue" stroke-width="'+sWidth+'" fill="white" />';
    
    for (var i = 0; i <= 59; i++)//draw the numbers and strokes around the clock face at calculated angles
    {   
        theta = 2*PI*(i/60);
        x = svgCir1.x + (svgCir1.r - (svgOffset/2)) * Math.sin(theta);
        y = svgCir1.y - (svgCir1.r - (svgOffset/2)) * Math.cos(theta);
       if ( Number.isInteger(i/5) ) //write the numbers that are mulitples of 5 and draw small sector lines around them
       {
           S +='<text id = "'+i+'" x="'+x+'" y="'+(y+3)+'" text-anchor="middle"  font-size="'+fontSize+'" fill="blue"><tspan alignment-baseline="middle" dominant-baseline="middle">'+i+'</tspan></text>';
           
           //draw inner sector line
           x1 = svgCir2.x + Math.sin(theta)*(svgCir2.r - ep2);
           y1 = svgCir2.y - Math.cos(theta)*(svgCir2.r - ep2);
           x2 = svgCir2.x + Math.sin(theta)*(svgCir2.r + ep2);
           y2 = svgCir2.y - Math.cos(theta)*(svgCir2.r + ep2);
           
           S+= '<line class = "'+i+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2 +
               '" style="stroke:'+fgColor+';stroke-width:'+sWidth+';stroke-linecap:round"/> ';
       
           //draw outer sector line
           x1 = svgCir2.x + Math.sin(theta)*(svgCir1.r-ep2);
           y1 = svgCir2.y - Math.cos(theta)*(svgCir1.r-ep2);
           x2 = svgCir2.x + Math.sin(theta)*svgCir1.r;
           y2 = svgCir2.y - Math.cos(theta)*svgCir1.r;
          
           S+= '<line class = "'+i+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2 +
               '" style="stroke:'+fgColor+';stroke-width:'+sWidth+';stroke-linecap:round"/> ';
       }
       else  //draw sector lines in the space between inner and outer circles
       {
           x1 = svgCir2.x + Math.sin(theta)*svgCir2.r;
           y1 = svgCir2.y - Math.cos(theta)*svgCir2.r;
           x2 = svgCir2.x + Math.sin(theta)*svgCir1.r;
           y2 = svgCir2.y - Math.cos(theta)*svgCir1.r;
           
           S+= '<line id = "'+i+'" x1="'+x1+'" y1="'+y1+
                   '" x2="'+x2+'" y2="'+y2 +
               '" style="stroke:'+fgColor+';stroke-width:'+sWidth+';stroke-linecap:round"/> ';
       }
       
    }
        //draw the inner arch   
       S += '<path id="innerArch" d=" M'+svgCir3.x+', '+svgCir3.y+' L'+svgCir3.x+', '+(svgCir3.y-svgCir3.r)+
            ' A'+svgCir3.r+', '+svgCir3.r+' 0 0,1 '+(svgCir3.x + svgCir3.r)+', '+svgCir3.y+ 
            '  Z"  fill="'+workColor+'"/>';
    
       //draw the clock hands
       S+= '<line id = "secondHand" x1="'+svgCir2.x+'" y1="'+svgCir2.y+'" x2="'+(svgCir2.x)+'" y2="'+(svgCir2.y - svgCir2.r +ep*SVG.w/800)+
               '" style="stroke:'+bgColor+';stroke-width:'+sWidth+';stroke-linecap:round"/> ';
       S+= '<line id = "minuteHand" x1="'+svgCir2.x+'" y1="'+svgCir2.y+'" x2="'+(svgCir2.x)+'" y2="'+(svgCir2.y - svgCir2.r + ep*1.5*SVG.w/800)+
               '" style="stroke:'+bgColor+';stroke-width:'+sWidth+';stroke-linecap:round"/> ';       
       S+= '<line id = "hourHand" x1="'+svgCir2.x+'" y1="'+svgCir2.y+'" x2="'+(svgCir2.x)+'" y2="'+(svgCir2.y - svgCir2.r + ep*2.2*SVG.w/800)+
               '" style="stroke:'+bgColor+';stroke-width:'+sWidth+';stroke-linecap:round"/> ';
    //draw the little center circle of the clock
        S += '<circle cx="'+svgCir1.x+'" cy="'+svgCir1.y+'" r="'+(15*SVG.w/300)+'" stroke="'+fgColor+'" fill="blue" />';
    S +='</svg>'; //close the <svg> element
    
    $('#svgDiv').append(S);  //append it to the body of the HTML file
    
    $('#secondHand').css('stroke',secColor); //.css() used because style="stroke:color" as opposed to stroke="color"
    $('#minuteHand').css('stroke',workColor);
    $('#hourHand').css('stroke',hrColor);
    
    if (origin===0){
        time = new Date();
        secondInterval = window.setInterval(rotateSecondHand, HandRotationInterval); //the clock hand can be updated at different rates making it tick smoothly or otherwise
        minuteInterval = window.setInterval(rotateMinuteHand, 10000);//rotate every one sixth of a minute
        hourInterval = window.setInterval(rotateHourHand, 360000); ////rotate every one tenth of an hour
        timeInterval = window.setInterval(syncTime,1000);
        colorMark(tempDuration/60000, tempColor, 1);
    }
}
    
    function colorMark(totalTimeInMinutes, color, which)//place a color
    {
        var hours = Math.floor(totalTimeInMinutes/60),
            minutes = totalTimeInMinutes - hours*60,
            theta = 2*Math.PI*(minutes/60),
            thetaHrs = 2*Math.PI*(hours/60),
            width = sWidth,
            x1 = svgCir2.x + Math.sin(theta)*(svgCir2.r - ep2*which), 
            y1 = svgCir2.x - Math.cos(theta)*(svgCir2.r - ep2*which),
            xHr, yHr;
    
        if (which === 1)
        {
            $('#outerArch').attr('fill',color);
            $('#innerArch').attr('fill',color);
            $('#minuteHand').css('stroke',color);  
            width += 2;
        }
        
        if ( Math.floor(minutes/5)!== (minutes/5) )//note:do not let both minute and hour coincide on the same stroke
        //also, take care of resetting color from black to fgColor
        {
          $('#'+minutes).css({'stroke':color,'stroke-width':''+width+''});
          $('#'+minutes).attr({'x1':''+x1+'', 'y1':''+y1+''});      
        }
        else
        {
          $('.'+minutes).css({'stroke':color, 'stroke-width':''+width+''});
          $('#'+minutes).attr('fill', color);
        }
        if (which === 0)//change color to paint the clock stripes black or blue on the hour marks
            color = fgColor;
        else 
            color = hrColor;
        
        
            xHr = svgCir2.x + Math.sin(thetaHrs)*(svgCir2.r - ep2*which);
            yHr = svgCir2.x - Math.cos(thetaHrs)*(svgCir2.r - ep2*which);            
        
        if ( Math.floor(hours/5)!== (hours/5) )
        {
          $('#'+hours).css({'stroke':color,'stroke-width':''+width+''});
          $('#'+hours).attr({'x1':''+xHr+'', 'y1':''+yHr+''});      
        }
        else
        {
          $('.'+hours).css({'stroke':color, 'stroke-width':''+width+''});
          $('#'+hours).attr('fill', color);
        }      
    }
    
    function progressArch()
    {
        $('#outerArch').attr('d', ''+calcArchD(svgCir0)+''); //.attr() used because d = "string" used instead of style="d:string"
        $('#innerArch').attr('d', ''+calcArchD(svgCir3)+'');
     
    }
    
    function calcArchD(svgCir)
    {
        var d = '', PI = Math.PI,
                x0 = svgCir.x, y0 = svgCir.y,
                x1 = svgCir.x, y1 = svgCir.y - svgCir.r,
                r0 = svgCir.r,
                percentWorkDone = tempTimeElapsed / tempDuration;
                theta = 2*PI*percentWorkDone,
                x2 = x0 + svgCir.r*Math.sin(theta),
                y2 = y0 - svgCir.r*Math.cos(theta);
        
        /*********************************************************************************
         * For A(radius-x,radius-y, rotation-x, large-flag, clockwise, x-to, y-to) below,
         * the large-flag has different results when the arch is smaller than half of a
         *  circle and when it is larger than half the circle
         *********************************************************************************/                       
        if (percentWorkDone <= 0.5) 
            d = 'M'+x0+', '+y0+' L'+x1+', '+y1+' A'+r0+', '+r0+' 0 0,1 '+x2+', '+y2+'  z';
        else
            d = 'M'+x0+', '+y0+' L'+x1+', '+y1+' A'+r0+', '+r0+' 0 1,1 '+x2+', '+y2+'  z';
        
        return d;      
    }
    
    function syncTime(){
        var t = new Date();
        tempTimeElapsed = t - time;
        degreeS = tempTimeElapsed/1000*6;
        //degreeM = tempTimeElapsed/10000; //60000*6;  See rotateMinuteHand()
        //degreeH = tempTimeElapsed/600000;    //3600000*6; See rotateHourHand()
    }
    function rotateSecondHand()
    {   
        degreeS += (6*HandRotationInterval)/1000;
        tempTimeElapsed += HandRotationInterval;
        
        $('#secondHand').attr('transform', 'rotate('+degreeS+','+svgCir2.x+','+svgCir2.y+')');   
        
        
         progressArch();

        if (workPeriod)
        {            
           if (tempTimeElapsed >= workDuration)
                reset(1);
        }
        else 
        {
            if (tempTimeElapsed >= breakDuration)
                reset(0);
        }
    }
    
    function reset(flag)
    {     
        tempTimeElapsed = 0;
        time = new Date();
        if (flag===1)
        {
            workTimeElapsed = 0;
            workPeriod = false;
            breakPeriod = true;
            tempDuration = breakDuration;
            tempColor = breakColor;
            colorMark(workDuration/60000, fgColor, 0); ////restore workColor to fgColor
            colorMark(tempDuration/60000, breakColor,1); //set color to breakColor          
            
        }
        else
        {
            breakTimeElapsed = 0;
            workPeriod = true;
            breakPeriod = false;
             tempColor = workColor;
            tempDuration = workDuration;
            colorMark(breakDuration/60000, fgColor, 0);
            colorMark(tempDuration/60000, workColor, 1);
            
            
                    }  
        degreeS = degreeM = degreeH = 0;
       
           window.clearInterval(secondInterval);
            window.clearInterval(minuteInterval);
            window.clearInterval(hourInterval);
            
        //clock hands restored to original positions    
        $('#secondHand').attr('transform', 'rotate('+degreeM+','+svgCir2.x+','+svgCir2.y+')');
        $('#minuteHand').attr('transform', 'rotate('+degreeM+','+svgCir2.x+','+svgCir2.y+')');
        $('#hourHand').attr('transform', 'rotate('+degreeM+','+svgCir2.x+','+svgCir2.y+')');
            
            secondInterval = window.setInterval(rotateSecondHand, HandRotationInterval);
            minuteInterval = window.setInterval(rotateMinuteHand, 10000);//every one-sixth of a minute
            hourInterval = window.setInterval(rotateHourHand, 360000); //every one-tenth of an hour            archInterval = window.setInterval(progressArch, HandRotationInterval);
           
   }
    
    function rotateMinuteHand()
    {   
        degreeM = tempTimeElapsed/10000;
        $('#minuteHand').attr('transform', 'rotate('+degreeM+','+svgCir2.x+','+svgCir2.y+')');    
    }
    function rotateHourHand()
    {   
        degreeH = tempTimeElapsed/600000;
        //$('#hourHand').css('stroke',hrColor) will not work
        $('#hourHand').attr('transform', 'rotate('+degreeH+','+svgCir2.x+','+svgCir2.y+')');        
    }
    
    function getUserTime(which, sessHr, sessMin, brkHr, brkMin)
    {
        console.log('Here\s the information: ',sessHr,' ',sessMin,' ', brkHr,' ', brkMin );
        if ( validInput( parseInt(sessHr), parseInt(sessMin), parseInt(brkHr), parseInt(brkMin) ) )
        {   colorMark(workDuration/60000, fgColor, 0);
            colorMark(breakDuration/60000, fgColor, 0);
            workDuration = sessHr*3600000 + sessMin*60000;
            breakDuration = brkHr*3600000 + brkMin*60000;
            reset(which);
        }
        else
        {
            alert("Invalid Input!!");
            $('#breakMinute').prop('value','1');;
            $('#breakHour').prop('value', '0');
            $('#sessionMinute').prop('value','2');
            $('#sessionHour').prop('value','0');
            return;   
        }        
    }
    
    function validInput(sessHr, sessMin, brkHr, brkMin)
    {
     var valid = false;
     console.log('Is this an integer?: ',sessHr," ",Number.isInteger(sessHr));
       if (Number.isInteger(sessHr)&&Number.isInteger(sessMin)&&Number.isInteger(brkHr)&&Number.isInteger(brkMin))
         if ( (sessHr>=0)&&(sessMin>=0)&&(brkHr>=0)&&(brkMin>=0)  )         
           if ( (sessHr<60)&&(sessMin<60)&&(brkHr<60)&&(brkMin<60)  )
              valid = true;
     
     return valid;
    }
  
  function resizeSVG(s)
  {
      SVG.w = s;
      SVG.h = s;
      svgOffset = 33*(SVG.w/300); //the difference in radii of circle1 and circle 2
      ep2 = 6*(SVG.w/300); //used as an offset for the short inter-circular dashes drawn to enclose the numbers
      fontSize = 14*(SVG.w/300);
      sWidth = 2.5 + 3*(SVG.w/300 - 1)*0.75; //the width of the clock hands i.e stroke width
      svgCir0 = {x:SVG.w/2, y:SVG.h/2, r:(SVG.w/2 - ep/4) };
      svgCir1 = {x:SVG.w/2, y:SVG.h/2, r:(SVG.w/2 - ep*2) };
      svgCir2 = {x:SVG.w/2, y:SVG.h/2, r:(SVG.w/2 - ep*2 - svgOffset) };
      svgCir3 = {x:SVG.w/2, y:SVG.h/2, r:(SVG.w/2 - ep*2 - svgOffset*1.8) };
      $('svg').remove();
      svgNumberClock(1);
      if (workPeriod)
           colorMark(tempDuration/60000, workColor,1);
       else
           colorMark(tempDuration/60000, breakColor,1);
          
  }