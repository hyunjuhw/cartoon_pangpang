var my = $;

(function($){

	/**
	@class $.Main
	@constructor
	**/

	my.Main = function(){

		var windowHeight = $(window).height();

		function init(){

			$('<div id="toTop">Back to Top</div>').appendTo($('body'));

			if($('#contents').find('#tableIndex').length){
				new my.Bookmark();
			}

			new my.Navigation();

			bindEvents();
		}

		/**
		@function bindEvents
		이벤트를 연결한다.
		**/
		function bindEvents(){
			var links = $('a.popup');

			links.click(function(event){
				 event.preventDefault();

				 var href = $(this).attr('href'),
					 width = $(this).attr('data-width'),
					 height = $(this).attr('data-height'),
					 scroll = $(this).attr('data-scroll'),
					 popup = window.open(href, "popup", "width=" + width + ", height=" + height + ", scrollbars=" + scroll + "");
			});

			$(window).scroll(function() {
				if($(this).scrollTop() > windowHeight ) {
					$('#toTop').fadeIn();	
				} else {
					$('#toTop').fadeOut();
				}
			});

			$('#toTop').click(function() {
				$('body,html').animate({scrollTop:0},800);
			});	
			
		}

		init();
	};

}(jQuery));

$(function() {

	new my.Main();

});

(function($){
		
	/**
	@class $.Generate
	@constructor
	**/

	my.Bookmark = function(){

		var $container = $('#contents'),
			$indexList = $container.find('#tableIndex'),
			$h2Tags = $container.find('h2').not('.tit'),
			$h3Tags = $container.find('h3'),
			otherNodes = $h2Tags.siblings(),
			num = 0,
			tagArr = [];
		
		for(var i=0; i < $h2Tags.length ; i++){
			tagArr[i] = [];
		}

		/**
		@function init
		초기화
		**/
		function init(){

			var h3Array = sortArry(otherNodes);

			attrIndex.apply($h2Tags);
			attrIndex.apply($h3Tags);

			generateList($indexList, $h2Tags);
			arrayToHtml(h3Array);

			bindEvents();

			//console.log($(h3Array[2][4]).text());
		}

		/**
		@function sortArry
		조건에 따라 elements를 분류하여 배열에 저장
		**/
		function sortArry(nodes){
			[].forEach.call(nodes, function(node, i){
				if(node.nodeName == 'H2'){
					num += 1;
				}else{
					node.nodeName=='H3' && tagArr[num-1].push(node);
				}
			});

			return tagArr;
		}

		/**
		@function attrIndex
		elements를 순회하며 id 속성 설정
		**/
		function attrIndex(){
			var index = 0;
			var tagName = this[index].nodeName.toLowerCase();

			this.each(function(i){
				index += 1;
				$(this).attr('id', tagName + '_' + index);
			});
		}

		/**
		@function arrayToHtml
		배열을 순회하며 배열요소를 기반으로 list를 동적으로 생성
		**/
		function arrayToHtml(arrObj){
			var $lists = $indexList.find('ol').children('li');

			arrObj.forEach(function(arr,i){
				generateList($lists.eq(i), arr);
			});
		}

		/**
		@function generateList
		elements를 순회하며 list를 동적으로 생성
		**/
		function generateList(root, elements){
			var elem = elements,
						parent = root,
						$ol = $('<ol>');

			[].forEach.call(elem, function(el, i){
				var innerText = el.innerHTML;
				var idNum = el.getAttribute('id');
				var target = document.getElementById(idNum);
				var $list = $('<li><a href="#'+idNum+'">'+ innerText +'</a></li>');
				$ol.append($list);
			});

			parent.append($ol);
		}

		/**
		@function bindEvents
		element와 event를 바인드
		**/
		function bindEvents(){
			$indexList.find('a').bind('click', function(e){
				e.preventDefault();
				var link = $(this).attr('href');
				var target = $(link);
				scroll(target);
			});
		}

		/**
		@function scroll
		element의 위치로 scroll
		**/
		function scroll(target) {
			if( target.offset() != undefined ){
				var ypos = parseInt(target.offset()['top'],10)-110;

				$('body,html').animate({scrollTop:ypos},800);
			} 
		}

		init();
	}

}(jQuery));

(function($){

	/**
	@class $.Gnb
	@constructor
	**/
	my.Gnb = function(gnbMenu, subMenu){
		 var $gnb = null;

		 this.gnbMenu = gnbMenu;
		 this.subMenu = subMenu;
		 this.getTest = function(){
			  alert(this.subMenu[2].title);
		 };
	};

	my.Gnb.prototype = {
		/**
		@function initMenu
		menu element 태그를 생성한다
		**/
		 initMenu: function(){
			var subwrap = $('.sub-wrap');
			var subnav = document.createElement('nav'); //IE8을 위해 node생성
			subnav.setAttribute('id','sub-nav');
			subwrap.append(subnav);
			$gnb = $('<ul />').appendTo($('nav#sub-nav'));
		 },
		/**
		@function makeMenu
		menu를 생성한다.
		**/
		 makeMenu : function(){
			  //var cnt = 0;
			 var tmp="";
			 $gnb.append($('<li />'));
			 var $list = $gnb.children(':last').append($('<a />'));
			 var $link = $list.find('a').attr('href','#').text(this.gnbMenu);
			 $('<ul class="drop-nav" />').insertAfter($link);
			 $('<ul class="sub-nav">').insertAfter($link);

			 for(var i=0; i<this.subMenu.length; i++){
				  tmp+='<li><a href="'+this.subMenu[i].link+'" target="'+this.subMenu[i].target+'">'+this.subMenu[i].title+'</a></li>';
			 }

			 $list.find('.drop-nav').html(tmp);
			 $list.find('.sub-nav').html(tmp);
		 }
	};

}(jQuery));

(function($){

	/**
	@class $.Navigation
	@constructor
	**/
	my.Navigation = function(){

		var gnbName = [],
			cnt = 0;

		var subMenu = {
				"Javascript" : [
				   {title : "Javascript core", link : "/jquerylab/javascript/javascript.core.html?hn=1&sn=1", target     : "_self"},
				   {title : "Javascript 객체지향", link : "/jquerylab/javascript/javascript.oop.html?hn=1&sn=2", target : "_self"},
				   {title : "JavaScript Patterns", link : "/jquerylab/pattern/javascript.pattern.html?hn=1&sn=3", target : "_self"},
				   {title : "Javascript Dom", link : "/jquerylab/dom/javascript.dom.html?hn=1&sn=4", target : "_self"},
				   {title : "Javascript Graphics", link : "/jquerylab/graphics/javascript.graphics.html?hn=1&sn=5", target : "_self"},
				   {title : "Effective Javascript", link : "/jquerylab/javascript/javascript.effective.html?hn=1&sn=6", target : "_self"},
				   {title : "AngularJS 프로그래밍", link : "/jquerylab/angularJS/angularjs.html?hn=1&sn=7", target : "_self"}
				],
				"jQuery" : [
				   {title : "jQuery Cookbook", link : "/jquerylab/jquery/cookbook/jquery.cookbook.html?hn=2&sn=1", target : "_self"},
				   {title : "jQuery DOM", link : "/jquerylab/jquery/jquery.dom.html?hn=2&sn=2", target     : "_self"}
				],
				"Performance" : [
				   {title : "Script 성능 최적화", link : "/jquerylab/performance/javascript.loading.html?hn=3&sn=1", target : "_self"},
				   {title : "JavaScript 성능이야기", link : "/jquerylab/pattern/javascript.optimize.html?hn=3&sn=2", target : "_self"}
				],
				"HTML" : [
				   {title : "HTML5", link : "/jquerylab/html5/html5.html?hn=4&sn=1", target : "_self"},
				   {title : "HTML5 Programming", link : "/jquerylab/html5/html5Programming.html?hn=4&sn=2", target : "_self"}
				],
				"CSS" : [
				   {title : "CSS2", link : "/jquerylab/css2/css.guide.html?hn=5&sn=1", target : "_self"},
				   {title : "CSS3", link : "/jquerylab/css3/css3.html?hn=5&sn=2", target : "_self"}
				],
				"Mobile" : [
					{title : "jQuery Mobile", link : "/jquerylab/mobile/jquery.mobile.1.1.html?hn=6&sn=1", target : "_self"},
					{title : "Mobile Web", link : "/jquerylab/mobile/mobile_web.html?hn=6&sn=2", target : "_self"}
				],
				"Node" : [
					{title : "모던웹을 위한 Node.js 프로그래밍", link : "/jquerylab/node/node.js.html?hn=7&sn=1", target : "_self"}
				]
			 };
		
		/**
		@function init
		초기화함수
		Gnb 객체를 생성하고 Event를 연결한다.
		**/
		function init(){

			$.each(subMenu, function(key,value){
				 gnbName[cnt] = new my.Gnb(key, subMenu[key]);
				 cnt++;
			});

			//window.location.search는 URL에 붙은 매개변수 반환
			if(!window.location.search) return false;

			var params = window.location.search.substring( 1 ).split( '&' ),
				hn = params[0].split( '=' ),
				sn = params[1].split( '=' ),
				hnNum = parseInt( hn[1] ),
				snNum = parseInt( sn[1] ),
				gnb,
				sub,
				offsetX,
				scrollpos;

			for(var i=0,len=gnbName.length;i<len;i++){
				 if(i==0) gnbName[0].initMenu();
				 gnbName[i].makeMenu();
			}

			gnb = $('nav#sub-nav').find($('ul')).children().eq(hnNum-1).addClass('sel');
			offsetX = gnb.offset().left - $('.sub-wrap').offset().left;
			
			sub = gnb.find('ul.sub-nav').show();
			if(hnNum!=1) sub.css('left',offsetX-sub.children().outerWidth());
			sub.children().eq(snNum-1).addClass('on');

			dropDown();
			scrollingEvents();
		}

		/**
		@function dropDown
		서브 메뉴를 드롭다운 시킨다.
		**/
		function dropDown() {

			if (!$('nav#sub-nav').length) {
				return;
			}

			$('nav#sub-nav').find($('ul > li:has(ul)')).hover(
				function() {
					if($(this).hasClass('sel')) return false;

					$(this).addClass('active');

					var self_width = $(this).outerWidth();
					var drop_width = $(this).find('ul.drop-nav').slideDown('fast').outerWidth();

					if(self_width>drop_width){
						$(this).find('ul.drop-nav').css('width', (self_width-10)+'px');
					}
				},
				function() {
					$(this).removeClass('active');
					$(this).find('ul.drop-nav').hide();
				}
			);
		}

		function scrollingEvents(){
			$(window).on('scroll', function(){
				scrollpos = $(this).scrollTop() > 98;
				var fixed = $('header').hasClass('fixed');

				if((!fixed && scrollpos) || (!scrollpos && fixed)){
					$('header').toggleClass('fixed');
					$('#tableIndex').toggleClass('index');
					$('#tableIndex').toggleClass('sticky');
					$('#contents').toggleClass('space');
				}
			});
		}

		init();

	}


}(jQuery));


$(document).ready(function(){

	showHideToggle();

});



;(function($){

	//이미지 롤링 사용자정의 플러그인

	$.fn.rollingBanner = function(options){
		
		var time;
		var opts = $.extend({
	
				getAutoSlide:function(){

					if(el.data("current") < el.data("numElmts")-1){
						el.data("current", el.data("current")+1);
					}else{
						el.data("current", 0);
					}

					opts.getBtnStatus();

					if(!el.data("isAnimating")){
						opts.getSlide();
					}

					time = setTimeout(function(){
						opts.getAutoSlide();
					}, 3000);

				},
				getSlide:function(){	

					if(el.data("button")!=null){

						el.data("button").each(function(){
							var btOff = $('img',$(this)).attr('src').replace("_.png",".png");
							$('img',$(this)).attr('src',btOff);
						});

						el.data("button").eq(el.data("current")).find('img').attr('src', el.data("button").eq(el.data("current")).find('img').attr('src').replace('.png','_.png'));		//현재 인덱스값을 가지는 롤링버튼을 활성화
					}

					if(el.data("effect")!=true){				//action변수가 true가 아닐경우 슬라이드 효과없이 현재의 인덱스값을 갖는 이미지를 보여줌.
						el.data("element").hide();
						el.data("element").eq(el.data("current")).show();

						el.data("isAnimating", false);

					}else{							//action변수가 true일 경우 현재의 인덱스값을 갖는 이미지로 슬라이드됨

						if(el.data("mode")=='vertical'){
							el.data("slider").animate({'top':-(el.data("height")*el.data("current")*el.data("step"))+'px'},el.data("speed"),function(){el.data("isAnimating", false);});
						}else if(el.data("mode")=='horizontal'){
							el.data("slider").animate({'left':-(el.data("width")*el.data("current")*el.data("step"))+'px'},el.data("speed"),function(){el.data("isAnimating", false);});
						}

						el.data("isAnimating", true);
					}

				},
				getBtnStatus:function(){
					//이미지의 인덱스값에 따라 이전,다음 버튼 활성여부 지정
					if(el.data("current")>0 || el.data("current")<el.data("numElmts")-1){				
						el.data("prev").show();
						el.data("next").show();
					}
					if(el.data("current")==0){
						el.data("prev").hide();
						el.data("next").show();
					}
					if(el.data("current")>=el.data("numElmts")-1){
						el.data("prev").show();
						el.data("next").hide();
					}
				}
			}, $.fn.rollingBanner.defaults, options||{});

		var	el = this;

		if(!this.length){
			return;
		}

		return this.each(function(){
			var $t = $(this);
			var o = $.metadata ? $.extend({},opts,$t.metadata) : opts;	// options 개체

			el.data("mode", o.mode);
			el.data("step", o.step);
			el.data("button", $(o.button,$t).children());
			el.data("prev", $(o.prev,$t));
			el.data("next", $(o.next,$t));
			el.data("slider", $(o.container,$t).find(o.slides));
			el.data("element", el.data("slider").children());
			el.data("numElmts", el.data("element").size());
			el.data("width", el.data("element").outerWidth());
			el.data("height", el.data("element").outerHeight());
			el.data("speed", o.speed);	
			el.data("effect", o.effect);	
			el.data("current", 0);								//현재 보여지는 이미지의 인덱스값을 저장하기 위한 변수
			el.data("autostart", o.autostart);
			el.data("isAnimating", false);

			el.data("prev").hide();

			if(el.data("autostart")){
				time = setTimeout(function(){
					o.getAutoSlide();
				},3000);
			}

			if(el.data("mode")=='horizontal'){
				el.data("slider").css('width',el.data("numElmts")*el.data("width")+'px');
				el.data("element").css('float','left');
			}

			el.data("button").bind({
				mouseenter:function(){
					if(!el.data("autostart")) return false;

					clearTimeout(time);
				},
				mouseleave:function(){
					if(!el.data("autostart")) return false;

					time = setTimeout(function(){
						o.getAutoSlide();
					}, 3000);
				},
				click : function(){
					var index = el.data("button").index(this);
					el.data("current",index);

					o.getBtnStatus();

					if(!el.data("isAnimating")){
						o.getSlide();
					}

					this.blur();
					return false;
				}
			});
			//이전 버튼 클릭시
			el.data("prev").bind({
				mouseenter:function(){
					if(!el.data("autostart")) return false;

					clearTimeout(time);
				},
				mouseleave:function(){
					if(!el.data("autostart")) return false;

					time = setTimeout(function(){
						o.getAutoSlide();
					}, 3000);
				},
				click:function(){
					if(el.data("current")==el.data("numElmts")-1) el.data("next").show();	//이미지 인덱스값이 마지막이 아닐경우 비활성화된 다음버튼을 활성화	
					el.data("current", el.data("current")-1);							//이미지 인덱스값 1씩 감소

					o.getSlide();

					if(el.data("current")==0) $(this).hide();	//이미지 인덱스값이 0일 경우, 즉 현재 첫번째 이미지가 활성화될 경우 이전버튼을 비활성화

					return false;
				}
			});

			//다음 버튼 클릭시
			el.data("next").bind({
				mouseenter:function(){
					if(!el.data("autostart")) return false;

					clearTimeout(time);
				},
				mouseleave:function(){
					if(!el.data("autostart")) return false;

					time = setTimeout(function(){
						o.getAutoSlide();
					}, 3000);
				},
				click:function(){
					el.data("current",el.data("current")+1);							//이미지 인덱스값 1씩 증가
					
					o.getSlide('next');

					if(el.data("current")>=el.data("numElmts")-1) $(this).hide();	//이미지인덱스값이 마지막일 경우, 즉 현재 마지막 이미지가 활성화될 경우 다음버튼을 비활성화
					if(el.data("current")>0) el.data("prev").show();			//이미지인덱스값이 0이 아닌경우 이전버튼 활성화

					return false;
				}
			});


		});
	};

	// 기본 옵션들
	$.fn.rollingBanner.defaults = {
		container : '.rolling-bx',	//	classname attached to the slider wraper
		slides : '.banner-list',	//	slider classname
		button : '.event-bt',		//	button classname
		prev : '.prev',
		next : '.next',
		step : 1,
		speed : 'slow',				//	'slow','normal','fast'
		effect : false,
		mode : 'vertical',			//	'horizontal', 'vertical'
		autostart : false
	};

})(jQuery);

(function ($) {
	$.Form= function () {
		
		function init(){

			bindEvents();

			$(':checked').trigger('click');
		}

		function bindEvents(){
			
			/* checkbox toggle */
			$(':checkbox').click(function(){
				var $label = $(this).next('label');
				$(this).is(':checked') ? $label.addClass('on') : $label.removeClass('on');
				$(this).is(':checked') ? $(this).prop('checked', true) : $(this).prop('checked', false);
			});

			/* radio button toggle */
			$(':radio').click(function(){
				var $label = $(this).next('label');
				console.log($label);
				var val = $(this).attr('name');
				var $labelGroup = $('input[name='+val+']').next();
				$labelGroup.removeClass('on');
				if($(this).is(':checked')){
					$('input[name='+val+']').prop('checked',false);
					$(this).prop('checked',true);
					$label.addClass('on');
				}
			});

		}

		init();

	};

}(jQuery));

$(function () {
	new $.Form();
});

/*
if ("undefined" == typeof jquerylab) jquerylab = {};

jquerylab.gnb = {
	menu_20121107 : {
		"Javascript" : [
			{title : "Javascript core", link : "/jquerylab/javascript/javascript.core.html?hn=1&sn=1", target	: "_self"},
			{title : "Javascript Dom", link : "/jquerylab/dom/javascript.node.html?hn=1&sn=2", target : "_self"},
			{title : "Javascript Graphics", link : "/jquerylab/graphics/javascript.graphics.html?hn=1&sn=3", target : "_self"}
		],
		"jQuery" : [
			{title : "jQuery Study", link : "/jquerylab/study/study.list.html?hn=2&sn=1", target : "_self"},
			{title : "jQuery Cookbook", link : "/jquery/cookbook/cookbook_list.html?hn=2&sn=2", target : "_self"},
			{title : "jQuery DOM", link : "/jquerylab/jquery/jquery.dom.html?hn=2&sn=3", target	: "_self"}
		],
		"Performance" : [
			{title : "Script 성능 최적화", link : "/jquerylab/performance/javascript.loading.html?hn=3&sn=1", target : "_self"},
			{title : "JavaScript Patterns", link : "/jquerylab/pattern/javascript.pattern.html?hn=3&sn=2", target : "_self"},
			{title : "JavaScript 성능이야기", link : "/jquerylab/pattern/javascript.pattern.html?hn=3&sn=3", target : "_self"}
		],
		"HTML" : [
			{title : "HTML4", link : "/jquerylab/html4/html4.html?hn=4&sn=1", target : "_self"},
			{title : "HTML5", link : "/jquerylab/html5/html5.html?hn=4&sn=2", target : "_self"},
			{title : "HTML5 Programming", link : "/jquerylab/html5/html5Programming.html?hn=4&sn=3", target : "_self"}
		],
		"CSS" : [
			{title : "CSS2", link : "/jquerylab/css2/css.guide.html?hn=5&sn=1", target : "_self"},
			{title : "CSS3", link : "/jquerylab/css3/css3.html?hn=5&sn=2", target : "_self"}
		],
		"Mobile" : [
			{title : "jQuery Mobile", link : "/jquerylab/mobile/jquery.mobile.1.1.html?hn=6&sn=1", target : "_self"},
			{title : "Mobile Web", link : "/jquerylab/mobile/mobile_web.html?hn=6&sn=2", target : "_self"}
		]
	},
	init_20121107 : function(){
		var _menu = jquerylab.gnb.menu_20121107;
		var $gnb = $('<ul id="gnb" />').appendTo($('#header'));
		var cnt = 0;

		$.each(_menu, function(i,n){
			$gnb.append($('<li />'));
			var $list = $gnb.children().eq(cnt).append($('<a />'));
			cnt++;
			var $link = $list.find('a').text(i);
			$link.attr('href',_menu[i][0].link).attr('target',_menu[i][0].target);
			$('<ul class="drop-nav" />').insertAfter($link);
			$('<div class="sub"><ul class="sub-nav">').insertAfter($link);
			var len = _menu[i].length;
			var tmp="";
			for(j=0;j<len;j++){
				tmp+='<li><a href="'+_menu[i][j].link+'" target="'+_menu[i][j].target+'">'+_menu[i][j].title+'</a></li>';
			}
			$list.find('.drop-nav').html(tmp);
			$list.find('.sub-nav').html(tmp);
		});
	}
};
*/



function showHideToggle(){
	var $bt = $('.btoggle');

	if($bt.length>1){
		var source = $bt.not(':first').find('a').css('background-image').replace('.gif','_.gif');
		$bt.not(':first').find('a').css('background-image',source);
		$bt.not(':first').find('a').text('Source Show');

		$bt.next().not(':first').hide();
	}

	$bt.find('a').click(function(e){
		var self = $(this);

		if(self.parent().next().is(':visible')){
			var source = self.css('background-image').replace('.gif','_.gif');
			self.css('background-image',source);
			self.text('Source Show');
			self.parent().next().hide();
		}else{
			var source = $(this).css('background-image').replace('_.gif','.gif');
			self.css('background-image',source);

			self.text('Source Hide');
			self.parent().next().show();
		}

		e.preventDefault();
		//window.scrollTo(0, window.document.body.scrollHeight);

	});
}

//popup

function pop(url,name,w,h){ window.open(url,name,'width='+w+',height='+h+',scrollbars=no') } //Popup(스크롤바없음)
function pops(url,name,w,h){ window.open(url,name,'width='+w+',height='+h+',scrollbars=yes') } //Popup(스크롤바있음)


//iframe 리사이징

function calcHeight(){ 
  //find the height of the internal page 
  var the_height= document.getElementById('member').contentWindow.document.body.scrollHeight; 
  //change the height of the iframe 
  document.getElementById('member').height= the_height+50; 
} 


/* 무한 반복하는 롤링 함수 */
/* 매개변수 container는 컨테이너 id */
/* 매개변수 objectId는 롤링할 객체 id */
/* 매개변수 step은 좌우로 이동할 개수 */
function fn_rollToEx(container,objectId,step,auto){

	// 롤링할 객체를 변수에 담아둔다.
	var el = $('#'+container).find('#'+objectId);
	var lastChild;
	var speed = 3000;
	var timer = 0;
	var autoplay = false;

	el.data('prev', $('#'+container).find('.prev'));	//이전버튼을 data()메서드를 사용하여 저장한다.
	el.data('next', $('#'+container).find('.next'));	//다음버튼을 data()메서드를 사용하여 저장한다.
	el.data('play', $('#'+container).find('#bStart'));
	el.data('stop', $('#'+container).find('#bStop'));
	el.data('size', el.children().outerWidth());		//롤링객체의 자식요소의 넓이를 저장한다.
	el.data('len', el.children().length);				//롤링객체의 전체요소 개수
	el.data('animating',false);
	el.data('step', step);								//매개변수로 받은 step을 저장한다.
	el.data('autoStart', false);								//매개변수로 받은 step을 저장한다.

	el.css('width',el.data('size')*el.data('len'));		//롤링객체의 전체넓이 지정한다.

	if(arguments.length==4){
		el.data('autoStart', auto);
	}

	if(el.data('autoStart')){
		if(timer==0){
			timer = setInterval(moveNextSlide, speed);
			autoplay = true;
		}
	}

	el.bind({
		mouseenter:function(){
			if(!autoplay) return false;

			if(timer!=0 && el.data('autoStart')){
				clearInterval(timer);
				timer=0;
			}
		},
		mouseleave:function(){
			if(!autoplay) return false;

			if(timer==0 && el.data('autoStart')){
				timer = setInterval(moveNextSlide, speed);
			}
		}
	});


	//el에 첨부된 prev 데이타를 클릭이벤트에 바인드한다.
	el.data('prev').bind({
		click:function(e){
			e.preventDefault();
			movePrevSlide();
		},
		mouseenter:function(){
			if(!autoplay) return false;

			if(timer!=0 && el.data('autoStart')){
				clearInterval(timer);
				timer=0;
			}
		},
		mouseleave:function(){
			if(!autoplay) return false;

			if(timer==0 && el.data('autoStart')){
				timer = setInterval(moveNextSlide, speed);
			}
		}
	});

	//el에 첨부된 next 데이타를 클릭이벤트에 바인드한다.
	el.data('next').bind({
		click:function(e){
			e.preventDefault();
			moveNextSlide();
		},
		mouseenter:function(){
			if(!autoplay) return false;

			if(timer!=0 && el.data('autoStart')){
				clearInterval(timer);
				timer=0;
			}
		},
		mouseleave:function(){
			if(!autoplay) return false;

			if(timer==0 && el.data('autoStart')){
				timer = setInterval(moveNextSlide, speed);
			}
		}
	});

	el.data('play').bind({
		click:function(){
			if(timer==0 && el.data('autoStart')){
				timer = setInterval(moveNextSlide, speed);
				autoplay = true;
			}
		}
	});

	el.data('stop').bind({
		click:function(){
			if(timer!=0 && el.data('autoStart')){
				clearInterval(timer);
				timer=0;
				autoplay = false;
			}
		}
	});

	function movePrevSlide(){
		if(!el.data('animating')){
			//전달된 step개수 만큼 롤링객체의 끝에서 요소를 선택하여 복사한후 변수에 저장한다.
			var lastItem = el.children().eq(-(el.data('step')+1)).nextAll().clone(true);
			lastItem.prependTo(el);		//복사된 요소를 롤링객체의 앞에 붙여놓는다.
			el.children().eq(-(el.data('step')+1)).nextAll().remove();	//step개수만큼 선택된 요소를 끝에서 제거한다
			el.css('left','-'+(el.data('size')*el.data('step'))+'px');	//롤링객체의 left위치값을 재설정한다.
		
			el.data('animating',true);	//애니메이션 중복을 막기 위해 첨부된 animating 데이타를 true로 설정한다.

			el.animate({'left': '0px'},'normal',function(){		//롤링객체를 left:0만큼 애니메이션 시킨다.
				el.data('animating',false);
			});
		}
		return false;
	}

    function moveNextSlide(){
		if(!el.data('animating')){
			el.data('animating',true);

			el.animate({'left':'-'+(el.data('size')*el.data('step'))+'px'},'normal',function(){	//롤링객체를 첨부된 size와 step을 곱한 만큼 애니메이션 시킨다.
				//전달된 step개수 만큼 롤링객체의 앞에서 요소를 선택하여 복사한후 변수에 저장한다.
				var firstChild = el.children().filter(':lt('+el.data('step')+')').clone(true);
				firstChild.appendTo(el);	//복사된 요소를 롤링객체의 끝에 붙여놓는다.
				el.children().filter(':lt('+el.data('step')+')').remove();	//step개수만큼 선택된 요소를 앞에서 제거한다
				el.css('left','0px');	////롤링객체의 left위치값을 재설정한다.

				el.data('animating',false);
			});
		}
		return false;
	}

}

// 롤링배너 함수
// container는 롤링배너의 컨테이너 id, bt는 롤링버튼의 id, objectId는 롤링객체의 id, isAni는 슬라이드효과를 위한 boolean 변수
function fn_rolling2(container,bt,objectId,isAni){

	var el = $('#'+container).find('#'+objectId);
	var lastChild;

	el.data('bt', $('#'+container).find('#'+bt).children());					//롤링버튼에 대한 선택자
//	var $obj = $('#'+objectId);						//objectId를 id로 갖는 롤링객체의 선택자
	el.data('prev', $('#'+container).find('#prev'));	//이전버튼에 대한 선택자
	el.data('next', $('#'+container).find('#next'));			//다음버튼에 대한 선택자
	el.data('size', el.children().outerWidth());		//롤링객체의 각 이미지 넓이값
	el.data('len', el.children().length);				//롤링객체의 이미지 갯수
	el.data('action',false);								//슬라이드효과를 위한 boolean변수
	el.data('current',0);								//현재 보여지는 이미지의 인덱스값을 저장하기 위한 변수
	el.data('firstMove',false);
	el.data('btClicked',false);

	el.css('width',el.data('size')*el.data('len'));						//롤링객체의 전체넓이 지정
	el.children().filter(':first-child').addClass('first');
	
	el.data('action', isAni);

	//롤링 버튼 클릭시
	el.data('bt').bind('click',function(){

		var idx = $('#'+container).find('#'+bt).children().index(this);	//클릭한 롤링버튼의 인덱스값 저장

		el.data('current',idx);								//롤링버튼의 인덱스값을 이미지의 인덱스값으로 지정

		if(el.data('action')!=true){				//action변수가 true가 아닐경우 슬라이드 효과없이 현재의 인덱스값을 갖는 이미지를 보여줌.
			el.children().hide();
			el.children().eq(el.data('current')).show();
		}else{							//action변수가 true일 경우 현재의 인덱스값을 갖는 이미지로 슬라이드됨

			if(el.data('current')==0){
				var firstClass = el.children().filter(function(){
					return $(this).hasClass('first');
				});
				var firstIndex = el.children().index(firstClass);
				el.animate({'left':'-'+(el.data('size')*firstIndex)+'px'},'slow',function(){
					var lessChild = el.children().filter(':lt('+firstIndex+')').clone(true);
					lessChild.appendTo(el);
					el.children().filter(':lt('+firstIndex+')').remove();
					el.css('left','0px');
				});
			}

			el.animate({'left':'-'+(el.data('size')*el.data('current'))+'px'},'slow',function(){
				el.data('firstMove', true);			
				el.data('btClicked', true);
			});
		}

		// 모든 롤링 버튼을 비활성화
		el.data('bt').each(function(){
			var source = $(this).find('img').attr('src').replace('_.png','.png');
			 $(this).find('img').attr('src',source);
		});

		// 선택한 롤링버튼을 활성화
		var source = $(this).find('img').attr('src').replace('.png','_.png');
		$(this).find('img').attr('src',source);

		trace();

		return false;
	});

	//이전 버튼 클릭시
	el.data('prev').bind('click',function(){

		if(!el.data('firstMove')){
			lastChild = el.children().eq(-1).clone(true);
			lastChild.prependTo(el);
			el.children().eq(-1).remove();
			el.data('firstMove', true)
			el.css('left','-740px');
		}

		if(el.data('current')==0){
			el.data('current', el.data('len')-1);
		}else{
			el.data('current', el.data('current')-1);							//이미지 인덱스값 1씩 감소
		}

		el.data('current')==5 ? el.data('bt').eq(0).find('img').attr('src', el.data('bt').eq(0).find('img').attr('src').replace('_.png','.png')) : el.data('bt').eq(el.data('current')+1).find('img').attr('src', el.data('bt').eq(el.data('current')+1).find('img').attr('src').replace('_.png','.png'));	//이전에 활성화된 롤링버튼을 비활성화
		el.data('bt').eq(el.data('current')).find('img').attr('src', el.data('bt').eq(el.data('current')).find('img').attr('src').replace('.png','_.png'));		//현재 인덱스값을 가지는 롤링버튼을 활성화

		if(el.data('action')!=true){				//action변수가 true가 아닐경우 슬라이드 효과없이 현재의 인덱스값을 갖는 이미지를 보여줌.
			el.children().hide();
			el.children().eq(el.data('current')).show();
		}else{							//action변수가 true일 경우 현재의 인덱스값을 갖는 이미지로 슬라이드됨
			if(el.data('btClicked')){
				el.animate({'left':'-'+(el.data('size')*el.data('current'))+'px'},'slow',function(){
					if(el.data('current')==0){
						lastChild = el.children().filter(':last-child').clone(true);
						lastChild.prependTo(el);
						el.children().filter(':last-child').remove();
						el.css('left','-740px');
						el.data('btClicked',false);
					}
				});
			}else{
				el.animate({'left': '0px'},'slow',function(){
					lastChild = el.children().filter(':last-child').clone(true);
					lastChild.prependTo(el);
					el.children().filter(':last-child').remove();
					el.css('left','-740px');
				});
			}
		}

		trace();

		return false;
	});

	//다음 버튼 클릭시
	el.data('next').bind('click',function(){
	
		el.data('current',(el.data('current')+1) % el.data('len'));					//이미지 인덱스값 1씩 증가

		el.data('bt').eq(el.data('current')-1).find('img').attr('src', el.data('bt').eq(el.data('current')-1).find('img').attr('src').replace('_.png','.png'));	//이전에 활성화된 롤링버튼을 비활성화
		el.data('bt').eq(el.data('current')).find('img').attr('src', el.data('bt').eq(el.data('current')).find('img').attr('src').replace('.png','_.png'));		//현재 인덱스값을 가지는 롤링버튼을 활성화

		if(el.data('action')!=true){				//action변수가 true가 아닐경우 슬라이드 효과없이 현재의 인덱스값을 갖는 이미지를 보여줌.
			el.children().hide();
			el.children().eq(el.data('current')).show();
		}else{							//action변수가 true일 경우 현재의 인덱스값을 갖는 이미지로 슬라이드됨
			el.animate({'left':'-'+(el.data('size')*2)+'px'},'slow',function(){
				var firstChild = el.children().filter(':first-child').clone(true);
				firstChild.appendTo(el);
				el.children().filter(':first-child').remove();
				el.css('left','-740px');
			});
		}

		trace();

		return false;
	});

	function trace(){
		$('#trace').find('span').text(el.data('current'));
	}

}

// 롤링배너 함수2
function fn_slide(options){

	var opts = jQuery.extend({},options);

	var $bt = $('#'+opts.container).find('#'+opts.bt).children();					//롤링버튼에 대한 선택자
	var $obj = $('#'+opts.container).find('#'+opts.obj);								//objectId를 id로 갖는 롤링객체의 선택자
	var $prev = $('#'+opts.container).find('#'+opts.prev).hide();					//이전버튼에 대한 선택자
	var $next = $('#'+opts.container).find('#'+opts.next);							//다음버튼에 대한 선택자
	var size = $obj.children().outerWidth();				//롤링객체의 각 이미지 넓이값
	var len = $obj.children().length;						//롤링객체의 이미지 갯수
	var effect = false;										//슬라이드효과를 위한 boolean변수
	var auto = false;
	var current = 0;										//현재 보여지는 이미지의 인덱스값을 저장하기 위한 변수
	var time;

	$obj.css('width',size*len);								//롤링객체의 전체넓이 지정
	effect = opts.effect;
	auto = opts.auto;

	if(auto){
		time = setTimeout('slideShow()',3000);
	}

	slideShow = function(){

		if(current < len-1){
			current++;
		}else{
			current=0;
		}

		controllStatus();

		moveControl('next');

		time = setTimeout('slideShow()',3000);
	}

	controllStatus = function(){
		//이미지의 인덱스값에 따라 이전,다음 버튼 활성여부 지정
		if(current>0||current<len-1){				
			$prev.show();
			$next.show();
		}
		if(current==0){
			$prev.hide();
			$next.show();
		}
		if(current>=len-1){
			$prev.show();
			$next.hide();
		}
	}

	moveControl = function(msg){
		if(opts.bt!=null){
			msg=='next'? $bt.eq(current-1).find('img').attr('src', $bt.eq(current-1).find('img').attr('src').replace('_.png','.png'))
							:$bt.eq(current+1).find('img').attr('src', $bt.eq(current-1).find('img').attr('src').replace('_.png','.png'));	//이전에 활성화된 롤링버튼을 비활성화
			$bt.eq(current).find('img').attr('src', $bt.eq(current).find('img').attr('src').replace('.png','_.png'));		//현재 인덱스값을 가지는 롤링버튼을 활성화
		}

		if(effect!=true){				//action변수가 true가 아닐경우 슬라이드 효과없이 현재의 인덱스값을 갖는 이미지를 보여줌.
			$obj.children().hide();
			$obj.children().eq(current).show();
		}else{							//action변수가 true일 경우 현재의 인덱스값을 갖는 이미지로 슬라이드됨
			$obj.animate({'left':'-'+size*current},'slow');
		}
	}

	$obj.bind({
		mouseenter:function(){
			if(!auto) return false;
			clearTimeout(time);
		},
		mouseleave:function(){
			if(!auto) return false;
			time = setTimeout('slideShow()',3000);
		}
	});

	//롤링 버튼 클릭시
	$bt.bind({
		mouseenter:function(){
			if(!auto) return false;
			clearTimeout(time);
		},
		mouseleave:function(){
			if(!auto) return false;
			time = setTimeout('slideShow()',3000);
		},
		click:function(){
			var idx = $bt.index(this);					//클릭한 롤링버튼의 인덱스값 저장

			current = idx;								//롤링버튼의 인덱스값을 이미지의 인덱스값으로 지정

			controllStatus();

			if(effect!=true){				//action변수가 true가 아닐경우 슬라이드 효과없이 현재의 인덱스값을 갖는 이미지를 보여줌.
				$obj.children().hide();
				$obj.children().eq(current).show();
			}else{							//action변수가 true일 경우 현재의 인덱스값을 갖는 이미지로 슬라이드됨
				$obj.animate({'left':'-'+size*current},'slow');
			}

			// 모든 롤링 버튼을 비활성화
			$bt.each(function(){
				var source = $(this).find('img').attr('src').replace('_.png','.png');
				 $(this).find('img').attr('src',source);
			});

			// 선택한 롤링버튼을 활성화
			var source = $(this).find('img').attr('src').replace('.png','_.png');
			$(this).find('img').attr('src',source);

			return false;
		}
	});

	//이전 버튼 클릭시
	$prev.bind({
		mouseenter:function(){
			if(!auto) return false;
			clearTimeout(time);
		},
		mouseleave:function(){
			if(!auto) return false;
			time = setTimeout('slideShow()',3000);
		},
		click:function(){
			if(current==len-1) $next.show();	//이미지 인덱스값이 마지막이 아닐경우 비활성화된 다음버튼을 활성화	
			current--;							//이미지 인덱스값 1씩 감소

			moveControl('prev');

			if(current==0) $(this).hide();	//이미지 인덱스값이 0일 경우, 즉 현재 첫번째 이미지가 활성화될 경우 이전버튼을 비활성화

			return false;
		}
	});

	//다음 버튼 클릭시
	$next.bind({
		mouseenter:function(){
			if(!auto) return false;
			clearTimeout(time);
		},
		mouseleave:function(){
			if(!auto) return false;
			time = setTimeout('slideShow()',3000);
		},
		click:function(){
			current++;							//이미지 인덱스값 1씩 증가
			
			moveControl('next');

			if(current>=len-1) $(this).hide();	//이미지인덱스값이 마지막일 경우, 즉 현재 마지막 이미지가 활성화될 경우 다음버튼을 비활성화
			if(current>0) $prev.show();			//이미지인덱스값이 0이 아닌경우 이전버튼 활성화

			return false;
		}
	});

}

/* 공지사항 롤링 함수 */
function fn_article(buttonID,containerID){

	var $element = $('#'+containerID).find('.notice-list');
	var $prev = $('#'+buttonID).find('.prev');
	var $next = $('#'+buttonID).find('.next');

	var size = new Array();
	var cnt = new Array();
	var move = $element.children().outerHeight();

	$element.each(function(idx){
		size[idx] = $element.eq(idx).children().length;
		cnt[idx] = 0;
	});

	$prev.bind('click',function(){
		$element.each(function(idx){
			cnt[idx]==0 ? cnt[idx] : cnt[idx]--;
			$element.eq(idx).animate({'top':'-'+cnt[idx]*move});
		});
		return false;
	});

	$next.bind('click',function(){
		$element.each(function(idx){
			cnt[idx]>=size[idx]-1 ? cnt[idx] : cnt[idx]++;
			$element.eq(idx).animate({'top':'-'+cnt[idx]*move});
		});
		return false;
	});
		
}

function fn_article2(buttonID,containerID){
	var $element = $('#'+containerID).find('.notice-list');
	var $prev = $('#'+buttonID).find('.prev');
	var $next = $('#'+buttonID).find('.next');

	var size = new Array();
	var move = $element.children().outerHeight();
	var first = false;
	var lastChild;

	$element.each(function(idx){
		size[idx] = $('#winning').length ? 5 : $element.eq(idx).children().length;
	});

	lastChild = $element.children().eq(-1).clone(true);
	lastChild.prependTo($element);
	$element.children().eq(-1).remove();

	if($element.children().length==1){
		$element.css('top','0px');
	}else{
		$element.css('top','-'+move+'px');
	}

	$prev.bind('click',function(){
		$element.each(function(idx){
			if(!first){
				$element.eq(idx).animate({'top': '0px'},'normal',function(){
					lastChild = $(this).children().eq(-1).clone(true);
					lastChild.prependTo($element.eq(idx));
					$(this).children().eq(-1).remove();
					$(this).css('top','-'+move+'px');
				});
				first = true;
				return false;
			}

			$element.eq(idx).animate({'top': '0px'},'normal',function(){
				lastChild = $(this).children().filter(':last-child').clone(true);
				lastChild.prependTo($element.eq(idx));
				$(this).children().filter(':last-child').remove();
				$(this).css('top','-'+move+'px');
			});
		});
		return false;
	});

	$next.bind('click',function(){
		$element.each(function(idx){

			var firstChild = $element.children().filter(':first-child').clone(true);
			firstChild.appendTo($element.eq(idx));
			$element.children().filter(':first-child').remove();
			$element.css('top','0px');

			$element.eq(idx).animate({'top':'-'+move+'px'},'normal');

		});
		return false;
	});
		
}

// 파일 업로드
function fn_fileUpload(){
	var $img = $('fieldset.attach input[type=image]');
	var img_width = $img.attr('width');
	var $file = $('fieldset.attach input#upload').css({
		"position": "absolute",
		"top": "0px",
		"right": "0px",
		"width": img_width+"px",
		"cursor": "pointer",
		"opacity": "0.0"
	});
	$file.bind('change',function(){
		var filename = $(this).val();
		$('fieldset.attach input#file').attr("disabled","disabled").val(filename);

	});
};

/************************************************************************************
 * jQuery Layer Popup

 * @param targetID : 레이어 팝업의 ID
 * @param options : 레이어 팝업의 위치와 넓이등 레이어팝업의 정보
 ************************************************************************************/

function openLayer(targetID, options){
	var $layer = $('#'+targetID);
	var $close = $layer.find('.close');
	var width = $layer.outerWidth();
	var ypos = options.top;
	var xpos = options.left;
	var marginLeft = 0;
	
	if(xpos==undefined){
		xpos = '50%';
		marginLeft = -(width/2);
	}

	if(!$layer.is(':visible')){
		$layer.css({'top':ypos+'px','left':xpos,'margin-left':marginLeft})
			.show();
	}

	$close.bind('click',function(){
		if($layer.is(':visible')){
			$layer.hide();
		}
		return false;
	});
}

/************************************************************************************
 * jQuery Tooltip

 * @param containerID : 링크(a태그)와 툴팁을 포함하고 있는 컨테이너 요소의 ID
 * @param linkID : 링크(a태그)를 포함하고 있는 부모 요소의 ID
 * @param titleVar : 링크(a태그)의 title을 툴팁 텍스트로 설정하길 원하면 인자의 값을 true로 설정 
 * @param event : 이벤트 타입
 ************************************************************************************/

function fn_tooltip(containerID,linkID,titleVar,event){

	var $container = $('#'+containerID);
	var $link = $container.find('#'+linkID).find('>a');
	var $tooltip = $container.find('.tooltip');

	var title = titleVar; // 'title'속성을 툴팁 텍스트로 설정시 true로 설정하다.
	var eventType = event;	// 이벤트 type 설정
	var text ='';

	if(title){
		text = $link.attr('title');	//title변수가 true이면 'a'태그의 'title'속성에서 텍스트를 가져와 text변수에 저장한다.
	}


	$link.bind({
		'mouseenter' :function(e){

			var evnt = e;
			showTooltip(evnt);
		},
		'mousemove': function(e){

			var evnt = e;
			showTooltip(evnt);
		},
		'mouseleave': function(e){

			hideTooltip();
		}
	});

	if(eventType=='mouseover'){		// 이벤트 type이 'mouseover'이면 'mousemove'이벤트를 제거하여 showTooltip 함수가 실행되는 것을 막는다. 
		$link.unbind('mousemove');
	}

	function showTooltip(evnt){

		var e = evnt;	//이벤트 객체를 변수로 저장

		if(eventType=='mouseover'||eventType=='mousemove'){	//이벤트 type이 'mouseover'이거나 'mousemove'이면 실행될 공통 구문 (이벤트 좌표를 구하는 구문)

			var ex = e.pageX;	//이벤트가 발생한 x좌표
			var ey = e.pageY;	//이벤트가 발생한 y좌표

			var offset = $container.offset();	// 브라우저의 screen 좌표(0,0)에서 $container요소가 위치한 오프셋 좌표
			var offsetX = ex - offset.left;		// 이벤트가 발생한 x좌표에서 $container요소의 오프셋좌표의 x좌표를 뺀 값을 변수에 저장 ($container요소의 position이 relatvie일때 유효함)
			var offsetY = ey - offset.top;		// 이벤트가 발생한 y좌표에서 $container요소의 오프셋좌표의 y좌표를 뺀 값을 변수에 저장 ($container요소의 position이 relatvie일때 유효함)
		}

		if(title){
			$link.attr('title','');	// 'a'태그의 'title'속성의 텍스트를 지운다.
			$tooltip.html(text);	// text변수에 저장된 텍스트를 $tooltip 텍스트로 설정한다.
		}

		if(eventType=='mouseover'||eventType=='mousemove'){		//$tooltip의 넓이와 높이값을 변수에 저장한다.
			var width = $tooltip.outerWidth();		
			var height = $tooltip.outerHeight();
		}

		$tooltip.show();	//$tooltip를 화면에 보여준다.

		if(eventType=='mouseover'||eventType=='mousemove'){
			$tooltip.css({ 'left' : offsetX, 'top' : offsetY-height-10 });	//이벤트가 발생한 좌표를 $tooltip의 좌표로 설정한다.
		}

	}

	function hideTooltip(){

		$tooltip.hide();
		
		if(title){
			$tooltip.html('');
			$(this).attr('title',text);
		}
	}

}
