if (!window.WebSocket) {
    document.body.innerHTML = 'WebSocket в этом браузере не поддерживается.';
}

// создать подключение
socket = new WebSocket('wss://ws.binaryws.com/websockets/v3');
isAuth=0
isMonitoring=0
serverTime=0
startbuy=0
contract_type="CALL"
proposalID=""
paramsSaved=0
tradeStart=0
prybutokVidsotok=0
monitorStart=0
monitorEnd=0


currentPrice=0

price=parseFloat(1)
amount= 1
basis="stake"
contract_type="CALL"
currency= "USD"
duration= 60
duration_unit= "m"
symbol= "frxEURUSD"
dateStart= new Date();
dateEnd= new Date();





//socket.send(outgoingMessage);

// обработчик входящих сообщений
socket.onmessage = function(event) {
    console.log("new message")
    incomingMessage = JSON.parse(event.data);

    if (typeof incomingMessage.proposal != 'undefined') {
        if (typeof incomingMessage.proposal.longcode != 'undefined') {  
            //console.log("==========prybutok calculate==============")
            $("#prybutokInvestovano").val(incomingMessage.proposal.ask_price)
            $("#prybutokPrognozVal").val(incomingMessage.proposal.payout)
            $("#prybutokPrognoz").text(incomingMessage.proposal.longcode)
            var tmp_amount=incomingMessage.proposal.ask_price //вкладено
            var tmp_payout=incomingMessage.proposal.payout //прибуток
            proposalID=incomingMessage.proposal.id
            //prybutokVidsotok=((tmp_amount/100)*(tmp_payout-tmp_amount))
            prybutokVidsotok=(tmp_payout-tmp_amount)/tmp_amount
            $("#prybutokVidsotok").text(prybutokVidsotok)
            buy_contract();
        }
    }

    if (typeof incomingMessage.tick != 'undefined') {

      if ( typeof incomingMessage.tick.quote != 'undefined') {
        //console.log("Price recieved")
        $("#cinaPotochna").text(incomingMessage.tick.quote)
        serverTime=incomingMessage.tick.epoch;

        if (monitorStart===0) {
            $("#monitorStart").text("Розпочато: " + Date(serverTime))
            monitorStart=1
        };


        currentPrice=parseFloat(incomingMessage.tick.quote)
        
        // max_lim=price+0.002
        // min_lim=price-0.002
        
        max_lim=price+0.5
        min_lim=price-0.5

        if (price>0) {
            /*if (currentPrice>=min_lim) {
                console.log("min -- diff=" + (currentPrice-min_lim) );
            };
            if (currentPrice<=max_lim) {
                console.log("max -- diff=" + (max_lim - currentPrice ) );  
            };*/

            //console.log("=====Work with price=====")
            if (((currentPrice>=min_lim) && (currentPrice<=max_lim))) {
                $("#logArea").text(Date(serverTime) + " :: Виявив ціну. Починай купувати" + "\n" + $("#logArea").text())  
                getPrognoz();  
                

            }else{
                $("#logArea").text(Date(serverTime) + " :: cina= " + incomingMessage.tick.quote + "\n" + $("#logArea").text())
            }    
        };

      }
    };


    if (typeof incomingMessage.authorize != 'undefined') {
        $("#infoEmail").text(incomingMessage.authorize.email)
        $("#infoBalance").text(incomingMessage.authorize.balance)
        $("#infoCurrency").text(incomingMessage.authorize.currency)
        $("#picConnect").attr("src","img/ok.png")
    }

    if (typeof incomingMessage.buy != 'undefined') {
        console.log("Баланс= " + incomingMessage.buy.balance_after + " Прогноз=" + incomingMessage.buy.longcode)

    }


    if (typeof incomingMessage.error != 'undefined') {
        console.log(incomingMessage.error.code + "::::" +incomingMessage.error.message)
        err=incomingMessage.error
    }


  
};



function auth () {
    if (isAuth==1) {
        $("#picConnect").attr("src","img/warning.png")
        return
    };
    var outMsg=JSON.stringify({
            "authorize": "eDryu5dgXAmdFVN"
        });
    console.log("auth Call");
    socket.send(outMsg, function ack(error) {
          showMessage("ERROR===" + incomingMessage + "===== " + error); 
        });
    isAuth=1
}


function getPrognoz () {


    //intervals=0
    //curent_unix=Math.floor(Date.now()/1000);
    // curent_time = new Date((curent_unix*1000));
    //current server time + 5 seconds for create request to buy contract
    var op=(parseInt(serverTime)+4)*1000;
    curent_time = new Date(op);
    minuts=curent_time.getMinutes();  
    intervals=CalcTime(minuts);
    if (duration!=0) {
        switch (duration_unit){
            case 's':
                intervals=intervals*(duration/60);
                break;
            case 'm': 
                intervals=intervals*duration;
                break;
            case 'h':
                intervals=intervals*(duration*60);
                break;
            default:
                break;
        }
    };
    // duration=5;
    //planedStart=new Date(curent_time.getFullYear(),curent_time.getMonth(),curent_time.getDate(),curent_time.getHours(),curent_time.getMinutes(),curent_time.getSeconds());
    planedEnd=new Date(curent_time.getFullYear(),curent_time.getMonth(),curent_time.getDate(),curent_time.getHours(),intervals);
    dateStart=(Date.parse(curent_time))/1000;
    dateEnd=(Date.parse(planedEnd))/1000;
    // console.log("------ start -------")
    // console.log("server time + 4 sec=    " + op)
    // console.log("converted date=    " + curent_time )
    // console.log("dateEnd=     " + dateEnd)
    // console.log("serverTime=" +     serverTime)
    //dateStart=Math.floor(planedStart);
    //dateEnd=Math.floor(planedEnd/1000);
    //console.log("prorok Call")
    var outgoingMessage = JSON.stringify({
        "proposal": 1,
        "amount": amount,
        "basis": basis,
        "contract_type": contract_type,
        "currency": currency,
        // "date_start" : dateStart,
        "date_expiry" : dateEnd,
        // "duration": duration,
        // "duration_unit": duration_unit,
        "symbol": symbol
      });
    socket.send(outgoingMessage, function ack(error) {
          showMessage("ERROR===" + incomingMessage + "===== " + error); 
        });
}


function SaveParameters () {
    if (isAuth==0) {
        auth();
    };    
    if (paramsSaved==1) {
        $("#picAmount").attr("src","img/warning.png")
        return
    };
    if ($("#contractType1").attr("checked")=="checked") {
        contract_type="CALL"
    }else{
        contract_type="PUT"
    }    

    price=parseFloat($("#price").val())
    amount= $("#amount").val()
    basis= "stake"
    contract_type= contract_type
    currency= "USD"
    duration= $("#duration_value").val()
    duration_unit= $("#duration_unit").val()
    symbol= $("#symbol").val()

    $("#picAmount").attr("src","img/ok.png")
    paramsSaved=1;
}

function MonitoringPrice () {
        //console.log("start MonitoringPrice function")
        if (isAuth==0) {
            auth();
        };
        if (isMonitoring==1) {
            return;
        };
        isMonitoring=1
        outgoingMessage1=JSON.stringify({
        
            // "ticks": "frxEURUSD"
            "ticks": symbol
        
        });
        socket.send(outgoingMessage1, function ack(error) {
          showMessage("ERROR===" + incomingMessage + "===== " + error); 
        });
        $("#picMonitoring").attr("src","img/ok.png")
        

}


function StartTrade () {
    if (isAuth==0) {
        auth();
    };
    if (isMonitoring==0) {
        MonitoringPrice();
    };
    if (tradeStart==1) {
        $("#picRunned").attr("src","img/warning.png")
        return
    };
    tradeStart=1

    $("#prybutokInvestovano").val("0")
    $("#prybutokPrognozVal").val("0")

    $("#cinaZadana").text(price)
    $("#picRunned").attr("src","img/ok.png")
}


  function CalcTime(min){
    var i=min;
    var result=[];

    if ((min%5)===0) {
        i+=1;
    };

    do{


        if ((i%5)===0) {
            result.start=min;
            result.end=i;
            result.diff=i-min;
            if (result.diff>=1) {
                return result.diff;
            }
        }
        i+=1;
    }
    while (i<60);
    
  }

  function buy_contract () {
        
        if (startbuy==1) {
            return;
        };
        console.log("call buy")

        //getPrognoz();
        buyContractMessage = JSON.stringify({
              "buy": proposalID,
              // "buy": 1,
              "price": 0,
              // "price": currentPrice,
              // "parameters":{
              //       "amount": amount,
              //       "basis": basis,
              //       "contract_type": contract_type,
              //       "currency": currency,
              //       // "date_start" : dateStart,
              //       "date_expiry" : dateEnd,
              //       // "duration": duration,
              //       // "duration_unit": duration_unit,
              //       "symbol": symbol
              // }
            });
        if (prybutokVidsotok>=0.75) { 
            startbuy=1
            if (monitorEnd===0) {
                $("#monitorEnd").text("Завершено: " + Date(serverTime))
                monitorEnd=1
            };
            $("title").text("[ok] Автоматична ставка")
            $("#textDone").text("Покупку здійснено! Оновіть сторінку для нового контракту")
            $("#indicatorDone").html('<img id="picDone" src="img/Done.png"  width="250" height="250" class="img-responsive" alt="Generic placeholder thumbnail">')         
            //alert("ГОТОВО! Можете переглянути деталі роботи")
            socket.send(buyContractMessage, function ack(error) {
                  showMessage("ERROR===" + incomingMessage + "===== " + error); 
                });
        };



  }





$( document ).ready(function() {

    $("#buttonConnectServer").on("click",function() {
        console.log("click buttonConnectServer")
        auth()
        //setInterval(getPrognoz(), 1000)
    })

    $("#buttonAccept").on("click",function() {
        console.log("click buttonAccept")
        SaveParameters()
    })

    $("#buttonPrognoz").on("click",function() {
        console.log("click buttonPrognoz")
        getPrognoz()
    })

    $("#buttonMonitoringPrice").on("click",function() {
        MonitoringPrice()
    })


    $("#buttonStart").on("click",function() {
        console.log("click buttonStart")
        StartTrade()
    })


    console.log( "ready!" );
});
