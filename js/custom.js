if (!window.WebSocket) {
    document.body.innerHTML = 'WebSocket в этом браузере не поддерживается.';
}

// создать подключение
socket = new WebSocket('wss://ws.binaryws.com/websockets/v3');
isAuth=0
isMonitoring=0
serverTime=0
contract_type="CALL"
proposalID=""
paramsSaved=0
tradeStart=0

currentPrice=0

price=parseFloat(1)
amount= 1
basis="stake"
contract_type="CALL"
currency= "USD"
duration= 60
duration_unit= "m"
symbol= "frxEURUSD"





//socket.send(outgoingMessage);

// обработчик входящих сообщений
socket.onmessage = function(event) {
    console.log("new message")
    incomingMessage = JSON.parse(event.data);

    if (typeof incomingMessage.proposal != 'undefined') {
        if (typeof incomingMessage.proposal.longcode != 'undefined') {  
            console.log("==========prybutok calculate==============")
            $("#prybutokPrognoz").text(incomingMessage.proposal.longcode)
            var tmp_amount=incomingMessage.proposal.ask_price
            var tmp_payout=incomingMessage.proposal.payout
            proposalID=incomingMessage.proposal.id
            $("#prybutokVidsotok").text(((tmp_amount/100)*(tmp_payout-tmp_amount)))
        }
    }

    if (typeof incomingMessage.tick != 'undefined') {

      if ( typeof incomingMessage.tick.quote != 'undefined') {
        console.log("Price write")
        $("#cinaPotochna").text(incomingMessage.tick.quote)
        serverTime=incomingMessage.tick.epoch;
        currentPrice=parseFloat(incomingMessage.tick.quote)
        
        max_lim=price+0.00005
        min_lim=price-0.00005
        

        if (price>0) {
            if ((currentPrice>=min_lim)&&(currentPrice<=max_lim)) {
                $("#logArea").text(serverTime + " :: Виявив ціну. Починай купувати" + "\n" + $("#logArea").text())
                $("#indicatorDone").html('<img id="picDone" src="img/Done.png"  width="250" height="250" class="img-responsive" alt="Generic placeholder thumbnail">')

            }else{
                $("#logArea").text(serverTime + " :: cina= " + incomingMessage.tick.quote + "\n" + $("#logArea").text())
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


    if (typeof incomingMessage.error != 'undefined') {
        console.log(incomingMessage.error.code + "::::" +incomingMessage.error.message)
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
    console.log("auth Call")
    socket.send(outMsg, function ack(error) {
          showMessage("ERROR===" + incomingMessage + "===== " + error); 
        });
    isAuth=1
}


function getPrognoz () {
    console.log("prorok Call")
    var outgoingMessage = JSON.stringify({
        "proposal": 1,
        "amount": amount,
        "basis": basis,
        "contract_type": contract_type,
        "currency": currency,
        "duration": duration,
        "duration_unit": duration_unit,
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
    duration= 60
    duration_unit= "m"
    symbol= $("#symbol").val()

    $("#picAmount").attr("src","img/ok.png")
    paramsSaved=1;
}

function MonitoringPrice () {
        if (isAuth==0) {
            auth();
        };
        if (isMonitoring==1) {
            return;
        };
        isMonitoring=1
        console.log("click buttonMonitoringPrice")
        outgoingMessage1=JSON.stringify({
        
            "ticks": "frxEURUSD"
        
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


    $("#cinaZadana").text(price)
    $("#picRunned").attr("src","img/ok.png")
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
