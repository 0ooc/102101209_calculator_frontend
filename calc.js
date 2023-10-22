'use strict';
var Calculator = {
  display: document.querySelector('#text textarea'), //获取text的textarea元素
  displayResult:document.querySelector('#text div'), //获取text的第一个div元素
  significantDigits: 11, //有效数字
  result: '',           //结果
  currentInputOperator:'',   //当前输入的运算符
  currentInput: '',        //当前输入
  lastOperator:'',         //上一个输入
  inputDigits: 0,         //输入的数字
  decimalMark: false,  //小数点
  isNegative: false, 

  canAppendOperate:function(){   //可以追加操作
	  return this.currentInputOperator==')'||this.currentInputOperator == '^2'||this.currentInputOperator == '!';
  },
  scrollDisplay:function scrollDisplay(){    //滚动显示
	  this.display.scrollTop = this.display.scrollHeight;  
  },
  updateDisplay: function updateDisplay() {    //更新显示
    var value = this.currentInput || this.result.toString();
    var infinite = new RegExp((1 / 0) + '', 'g');
    var outval = value.replace(infinite, '不能除以0').replace(NaN, 'Error');
    this.displayResult.textContent = outval;

    var screenWidth = this.displayResult.parentNode.offsetWidth - 60;
    var valWidth = this.displayResult.offsetWidth;
    var scaleFactor = Math.min(1, screenWidth / valWidth);
    this.displayResult.style.fontSize = 5.5 * scaleFactor + 'rem';


  },

  appendDigit: function appendDigit(value) {        //追加数字
    if (this.inputDigits + 1 > this.significantDigits ||
	    (this.currentInput === '0' && value === '0')) {
      return;
    }
    if (value === '.') {
      if (this.decimalMark) {
        return;
      } else {
        this.decimalMark = true;
      }
      if (!this.currentInput) {
        this.currentInput += '0';
	    this.display.value += '0';
      }
    } else {
      if (this.currentInput === '0' && value !== '0') {
        this.currentInput = '';
	    this.display.value = this.display.value.substring(0,this.display.value.length-1);
      }
      ++this.inputDigits;
    }
    this.currentInput += value;
	this.display.value += value;
    this.updateDisplay();
  },

  clearInput: function clearInput() {          //清除输入
    this.currentInput = '';
	this.currentInputOperator = '';
    this.result = 0;
    this.inputDigits = 0;
    this.decimalMark = false;
    this.isNegative = false;
    this.updateDisplay();
	this.display.value = '';
  },
  init: function init() {                  //初始化
    document.addEventListener('mousedown', this);   //当鼠标指针移动到元素上方，并按下鼠标按键时
    document.addEventListener('touchstart', function(evt){  //在一个或多个触点与触控设备表面接触时被触发
      var target = evt.target;
      if ((target.dataset.type == "value") || (target.value == "C") || (target.value == "=")) {
        target.classList.add("active");
      }
    });
    document.addEventListener('touchend', function(evt){
      var target = evt.target;
      if ((target.dataset.type == "value") || (target.value == "C") || (target.value == "=")) {
        target.classList.remove("active");
      }
    });
    this.updateDisplay();
	this.display.value = '';
  },
  handleOperator:function(value){                  //处理运算符
	  switch (value){
		  case '+':
		  case '-':
		  case '÷':
		  case '!':
		  case '%':
		  case '^':
		  case 'x':
			  if (value === this.currentInputOperator||this.currentInputOperator=='u') {
				  return;
			  }else if(!this.currentInputOperator&&!this.currentInput){
				  if(!this.result)
					  return;
				  this.display.value = this.result+value;
				  this.result = '';
			  }else if(this.currentInputOperator&&this.currentInputOperator!='u'&&!this.canAppendOperate()) {
				  this.display.value = this.display.value.replace(/.$/, value);
			  }else{
				  this.display.value += value;
			  }
			  this.currentInputOperator= value;
			  break;
		  case '^2':
			  if(!this.currentInputOperator&&!this.currentInput&&this.result){
				  this.display.value = this.result+value;
			  }else if(this.currentInput||this.currentInputOperator==')'){
				  this.display.value += value;
			  }
			  this.currentInputOperator = value;
			  break;
		  default :
			  if(!this.currentInputOperator&&!this.currentInput){
				  this.display.value = (this.result?this.result+'x':'') +value;
			  }else if(this.currentInputOperator=='!'||this.currentInputOperator==')'){
				  this.display.value += 'x'+value;
			  }else if(this.currentInputOperator){
				  this.display.value += value;
			  }else{
				  this.display.value += 'x'+value;
			  }
			  this.currentInputOperator = 'u';
			  break;
	  }
	  this.currentInput = '';
	  this.inputDigits = 0;
	  this.decimalMark = false;
	  this.lastOperator = value;
	  this.result = '';
  },
  toFixed:function(val){            //固定
	  val += '';
	  if(val.indexOf('e')>0){
		  val = val.replace(/([0-9\.]+)e/,function(str,num){
			  return parseFloat(num).toFixed(2)+'E';
		  })
		  return val;
	  }
	  var pos = val.indexOf('.');
	  if(pos > 0){
		if(val.length-pos-1>6){
			val = parseFloat(val).toFixed(6);
			val += '';
			pos = val.indexOf('.');
			if(val[pos+1]=='0'&&val[pos+2]=='0'&&val[pos+3]=='0'&&val[pos+4]=='0'){
				val = parseFloat(val).toFixed(0);
			}
		}

	  }else{
		  pos = val.length;
	  }
	  if(pos>10){
		  val = parseFloat(val).toFixed(pos-3);
		  val += '';
		  val = val[0]+'.'+val[1]+val[2]+'E+'+(pos-1);
	  }

	  return val;
  },
  handleCommand:function handleCommand(value){            //处理命令
	  switch (value) {
		  case '=':
			  if (this.display.value&&(this.currentInput||this.currentInputOperator.match(/[0-9\)!]$/))) {
				  this.result = core.calculate(this.display.value);
				  this.currentInput = '';
				  this.currentInputOperator = '';
				  this.inputDigits = 0;
				  this.decimalMark = false;
				  this.isNegative = false;

				  var xhr=new XMLHttpRequest(); //创建XMLHttpRequest对象
	              xhr.open('post','http://127.0.0.1:8000/app0/shangchuan/')	
				  xhr.setRequestHeader("Content-type",'application/json'); 
				  xhr.send(JSON.stringify({ arithmetic:this.display.value, out:this.result})); //将一个 JavaScript 对象或值转换为 JSON 字符串 
				  xhr.onreadystatechange=function(){
			      if(xhr.readyState==4&&xhr.status==200){    //异步调用过程完毕and异步调用成功	  
					console.log("记录已存入数据库")    //在控制台上输出信息
				   }
				}
				  if(core.isError){
					  this.updateDisplay();
					  this.result = '';
				  }else{
					  this.result = this.toFixed(this.result);
					  this.updateDisplay();
				  }
				  core.clear();

			  }
			  break;
		  case 'ans':
				 var ten=[];
				 var one=[];
				 var xhr1=new XMLHttpRequest();
				 xhr1.open('get','http://127.0.0.1:8000/app0/huode/')
				 xhr1.send()
				 xhr1.onreadystatechange=function(){
				 	if(xhr1.readyState==4&&xhr1.status==200){
						var hsy=JSON.parse(xhr1.responseText)   //将数据转换为 JavaScript 对象
						ten=hsy.data
						for(var j=0;j<ten.length;j++){
							var str=ten[j].arithmetic+"="+ten[j].out;
							one.push(str);
						}
						const data=one.join("\n"); //吧数组元素转成一个字符串用换行符分隔
						var text=document.getElementById("history");
						text.value=data;
					}
				}
			break;  	
		  case '(':
			  if(this.currentInput||this.canAppendOperate()){
				  return;
			  }else if(!this.currentInput&&!this.currentInputOperator){
				  this.clearInput();
			  }
			  this.display.value += '(';
			  this.currentInputOperator = 'u';
			  this.currentInput = "";
			  break;
		  case ')':
			  if(!this.currentInputOperator&&!this.currentInput){
				  return;
			  }
			  this.display.value += ')';
			  this.currentInputOperator = ')';
			  this.currentInput ='';
			  break;
		  case 'C':
			  this.clearInput();
			  break;
		  case 'back': 
			  if(this.currentInput === '') {
				  return;
			  } else {
				  if(this.currentInput.slice(-1) === '.') {
					  this.currentInput = this.currentInput.substring(0, this.currentInput.length-1);
					  this.decimalMark = false;
					  this.updateDisplay();
					  return;
				  }else if(this.isNegative&&this.currentInput.slice(-1) === '-') {
					  this.display.value = this.display.value.substring(0, this.display.value.length-3);
					  this.currentInput = '';
					  this.isNegative = false;
					  this.updateDisplay();
					  return;
				  }else if(this.isNegative&&this.display.value.slice(-1) === ')'){
					  this.display.value = this.display.value.substring(0, this.display.value.length-2)+')';
					  this.currentInput = this.currentInput.substring(0, this.currentInput.length-1);
					  --this.inputDigits;
					  this.updateDisplay();
					  return;
				  }

				  this.display.value = this.display.value.substring(0, this.display.value.length-1);
				  this.currentInput = this.currentInput.substring(0, this.currentInput.length-1);
				  --this.inputDigits;
				  if(this.inputDigits==0){
					  this.currentInputOperator = this.lastOperator;
				  }
			  }
			  this.updateDisplay();
			  break;
		  case '+/-':
			  if(!this.inputDigits)
			    return;
			  if(this.isNegative) {
				  this.currentInput = this.currentInput.slice(1);
				  this.display.value = this.display.value.replace(new RegExp('\\(\\-[0-9.]+\\)$','g'),this.currentInput);
			  } else {
				  this.currentInput = '-' + this.currentInput+'';
				  this.display.value = this.display.value.replace(new RegExp('[0-9.]+$','g'),'('+this.currentInput+')');
			  }
			  this.isNegative = !this.isNegative;
			  this.updateDisplay();
			  break;
	  }
  },
  handleEvent: function handleEvent(evt) {          //处理事件
    var target = evt.target;
	var targetName = target.nodeName.toLowerCase();
	 if(targetName == 'p'){
		target = target.parentNode;
	 }else if(targetName == 'sup'){
		 target = target.parentNode.parentNode;
	 }
    var value = target.getAttribute('value');
    switch (target.dataset.type) {
      case 'value':
	    if(this.result){
		    this.result = '';
	    }
	    if(!this.currentInputOperator&&!this.currentInput)
		    this.display.value="";
	    else if(this.currentInput=='s'||this.canAppendOperate()){
			return;
	    }
        this.appendDigit(value);
	    this.currentInputOperator = '';
        break;
	    case 'specialValue':
		    if(this.currentInput||this.canAppendOperate()){ return;}
		    else if(!this.currentInputOperator&&!this.currentInput) {this.clearInput();}
		    this.display.value += value;
		    this.currentInput = 's';
		    break;
      case 'operator':
		this.handleOperator(value);
        break;
      case 'command':
        this.handleCommand(value);
        break;
    }
	this.scrollDisplay();
  }
};
Calculator.maxDisplayableValue = '1e' + Calculator.significantDigits - 1;  //最大可显示值；有效数字

window.addEventListener('load', function load(evt) {  //当html页面的js和css加载完成时触发load函数
  window.removeEventListener('load', load);  //删除addEventListener事件
  Calculator.init();
});


var core={
	maxN:0,
	isError:false,
	errorResult:'Error',  //以下正则表达式：从文本中找出满足你想要的格式的句子
	specialCalculateExp: new RegExp('(tan|cos|sin|log|ln|√)([-]?[0-9\\.]+(E[\\+\\-][0-9]+)?)','g'),  //特殊计算
	factorialExp:new RegExp('([\\+\\-\\*%\/]?[-]?)([0-9\\.]+(E[\\+\\-][0-9]+)?)!','g'), //阶乘
	powExp:new RegExp('([\\+\\-\\*%\/]?[-]?)([0-9\\.]+)\\^([-]?[0-9\\.]+)','g'),  //幂
	secondPriorityOperator:new RegExp('[-]?[0-9\\.]+(E[\\+\\-][0-9]+)?([\\+\\-][-]?[0-9\\.]+(E[\\+\\-][0-9]+)?)+','g'), //第二优先级运算符
	secondPrioritySingleOperator:new RegExp('[\\+\\-][-]?[0-9\\.]+(E[\\+\\-][0-9]+)?','g'), //第二优先级单运算符
	firstPriorityOperator:new RegExp('[-]?[0-9\\.]+(E[\\+\\-][0-9]+)?([\\*\\/%][-]?[0-9\\.]+(E[\\+\\-][0-9]+)?)+','g'), //第一优先运算符
	firstPrioritySingleOperator:new RegExp('[\\*\\/%][-]?[0-9\\.]+(E[\\+\\-][0-9]+)?','g'), //第一优先级单运算符
	firstPriorityResult:null,   //第一优先级结果
	secondPriorityResult:null,   //第二优先级结果
	testResult:function(str){          //测试结果
		str = str+'';
		if(str.indexOf('NaN')>-1){
			this.isError = true;
			this.errorResult='Error';
			return true;
		}else if(str.indexOf('Infinity')>-1){
			this.isError = true;
			this.errorResult='不能除以0';
			return true;
		}
		return false;
	},
	showError:function(f,msg){     //显示错误
		console.error("core.js error: "+msg+" when it calculate "+f);
	},
	getCalculatorExp:function(){           //获取计算
		if(this.maxN<1) return null;
		return new RegExp("((tan|cos|sin|log|ln|√)?[-]?[0-9\\.!]+(E[\\+\\-][0-9]+)?([\\+\\-\\*%\/\\^](tan|cos|sin|log|ln|√)?[-]?[0-9\\.!]+(E[\\+\\-][0-9]+)?)*)(?=<\/b"+this.maxN+">)",'g');
	},
	clear:function(){           //清除
		this.maxN = 0;
		this.isError = false;
		this.errorResult = 'Error';
		this.firstPriorityResult = null;
		this.secondPriorityResult = null;
	},
	calculate:function(blockStr){        //计算
		var str = this.getBrak(blockStr);
		var calculatorExp = null;

		//get e,π
		str = str.replace(/e/g,Math.E);
		str = str.replace(/π/g,Math.PI);
		str = str.replace(/x/g,'*');
		str = str.replace(/÷/g,'/');

		var isEmpty;
		while(calculatorExp = this.getCalculatorExp()){
			isEmpty = true;
			str = str.replace(calculatorExp,function(calculatorString){
				if(core.isError) return calculatorString;
				isEmpty = false;
				if(calculatorString&&calculatorString!=""){
					return core.calculateWithoutBracket(calculatorString);
				}
				return calculatorString;
			});

			if(this.isError) {return this.errorResult;}

			if(isEmpty){
				this.isError = true;
				this.errorResult='Error';
				this.showError(blockStr,'there is nothing in the brackets');
				return this.errorResult;
			}

			//clear bracket
			str = str.replace(new RegExp("(<b"+this.maxN+">|<\\/b"+this.maxN+">)",'g'),'');
			this.maxN--;
		}
		str = this.calculateWithoutBracket(str);
		if(this.isError) {return this.errorResult;}

		return str;
	},
	//make <bN> to replace brackets
	getBrak:function(str){            //获取括号
		var  temp = str;
		if(!str)
			return null;
		var N=0;
		str = str.replace(/(\(|\))/g,function($0,$1){
			if($1=="("){ N++;  core.maxN = (N>core.maxN)?N:core.maxN; return "<b"+N+">"; }
			if($1==")"){
				$0 = "</b"+(N--)+">";
				if(N<0){
					core.isError = true;
					core.showError(temp,'the number of brackets is error');
				}
				return $0;
			}
		});

		if(N!=0){
			this.isError = true;
			this.showError(temp,'the number of brackets is error')
		}
		return str;
	},
	calculateWithoutBracket:function(str){     //计算不带括号
		var blockStr = str;
		str = this.preCalculate(str);
		if(str.indexOf('^')>-1){
			core.isError = true;
			core.showError(blockStr,'too many "^", you need use brackets');
			return str;
		}
		if(this.isError) {return str;}

		str = str.replace(this.firstPriorityOperator,function(calculatorString){
			return core.getFirstPriorityCalculatedResult(calculatorString);
		});
		if(this.isError) {return str;}

		str = str.replace(this.secondPriorityOperator,function(calculatorString){
			return core.getSecondPriorityCalculatedResult(calculatorString);
		});

		return str;
	},
	preCalculate:function(str){       //预计算

		str = str.replace(this.specialCalculateExp,function(calculatorString,operator,num){
			var specialResult = '';
			switch (operator){
				case 'tan':
					specialResult = Math.tan(num*0.017453293);
					break ;
				case 'sin':
					specialResult = Math.sin(num*0.017453293);
					break;
				case 'cos':
					specialResult = Math.cos(num*0.017453293);
					break;
				case 'log':
					specialResult = Math.log10(num);
					break;
				case 'ln':
					specialResult = Math.log(num);
					break;
				case '√':
					specialResult = Math.sqrt(num);
					break;
				default :
					return calculatorString;
			}
			specialResult +='';
			if(core.testResult(specialResult)){
				core.showError(calculatorString,"");
			}
			return specialResult;
		});

		//计算阶乘
		str = str.replace(this.factorialExp,function(calculatorString,operator,num,E,pos){
			if(operator.length==2||(pos === 0 && operator==='-')){
				core.isError = true;
				core.showError('-'+num+'!','factorial does not support a negative');
				return calculatorString;
			}
			var _factorial = factorial(num)+'';
			if(core.testResult(_factorial)) {
				core.showError(num + '!', 'factorial result is too large');
			}
			return operator+ _factorial;
		});

		//计算幂
		str = str.replace(this.powExp,function(calculatorString,operator,x,y){
			if(operator.length==2){ x= '-'+x;operator='-';}
			var _pow = Math.pow(x,y)+'';
			if(core.testResult(_pow)){
				core.showError(calculatorString,'Math.pow result is too large');
			}
			return operator+_pow;
		});

		return str;
	},
	getFirstPriorityCalculatedResult:function(str){    //获取第一优先级计算结果
		this.firstPriorityResult = str.match(/^[-]?[0-9\\.]+(E[\\+\\-][0-9]+)?/)[0];

		str.replace(this.firstPrioritySingleOperator,function(calculatorString){
			switch(calculatorString[0]){
				case '*':
					core.firstPriorityResult = core.firstPriorityResult *calculatorString.substring(1,calculatorString.length);
					break;
				case '/':
					core.firstPriorityResult = core.firstPriorityResult /calculatorString.substring(1,calculatorString.length);
					break;
				case '%':
					core.firstPriorityResult = core.firstPriorityResult %calculatorString.substring(1,calculatorString.length);
					break;
				default :
					break;
			}
			if(core.testResult(core.firstPriorityResult)){
				core.showError(calculatorString,calculatorString[0] + ' error');
			}
			return calculatorString;
		});
		return this.firstPriorityResult;
	},
	getSecondPriorityCalculatedResult:function(str){      //获取第二优先级计算结果
		this.secondPriorityResult = str.match(/^[-]?[0-9\\.]+(E[\\+\\-][0-9]+)?/)[0];

		str.replace(this.secondPrioritySingleOperator,function(calculatorString,minStr,index){
			if(index==0)
			    return calculatorString;
			switch(calculatorString[0]){
				case '+':
					core.secondPriorityResult = parseFloat(core.secondPriorityResult) +parseFloat(calculatorString.substring(1,calculatorString.length));
					break;
				case '-':
					core.secondPriorityResult = core.secondPriorityResult -calculatorString.substring(1,calculatorString.length);
					break;
				default :
					break;
			}
			if(core.testResult(core.secondPriorityResult)){
				core.showError(calculatorString,calculatorString[0] + ' error');
			}
			return calculatorString;
		});
		return this.secondPriorityResult;
	}
};


var g = 7;
var p = [
	0.99999999999980993,
	676.5203681218851,
	-1259.1392167224028,
	771.32342877765313,
	-176.61502916214059,
	12.507343278686905,
	-0.13857109526572012,
	9.9843695780195716e-6,
	1.5056327351493116e-7
];
var g_ln = 607/128;
var p_ln = [
	0.99999999999999709182,
	57.156235665862923517,
	-59.597960355475491248,
	14.136097974741747174,
	-0.49191381609762019978,
	0.33994649984811888699e-4,
	0.46523628927048575665e-4,
	-0.98374475304879564677e-4,
	0.15808870322491248884e-3,
	-0.21026444172410488319e-3,
	0.21743961811521264320e-3,
	-0.16431810653676389022e-3,
	0.84418223983852743293e-4,
	-0.26190838401581408670e-4,
	0.36899182659531622704e-5
];

// Spouge approximation (suitable for large arguments)
function lngamma(z) {        //ln伽马
	if(z < 0) return Number('0/0');
	var x = p_ln[0];
	for(var i = p_ln.length - 1; i > 0; --i) x += p_ln[i] / (z + i);
	var t = z + g_ln + 0.5;
	return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x)-Math.log(z);
}
function gamma (z) {      //伽马
	if (z < 0.5) {
		return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
	}
	else if(z > 100) return Math.exp(lngamma(z));
	else {
		z -= 1;
		var x = p[0];
		for (var i = 1; i < g + 2; i++) {
			x += p[i] / (z + i);
		}
		var t = z + g + 0.5;
		return Math.sqrt(2 * Math.PI)
			* Math.pow(t, z + 0.5)
			* Math.exp(-t)
			* x
			;
	}
};

var factorial = function factorial(z){     //阶乘
	if(0==z){
		return 1;
	}
	return z*factorial(z-1);
};
