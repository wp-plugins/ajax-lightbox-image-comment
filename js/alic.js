// INIT
var lboxClass = 'AjaxLightboxImgComment';
var lboxCtClass = 'AjaxLightboxImgCommentCt';	
var lboxImgClass = 'AjaxLightboxImgCommentImage';
var lboxImgCommentsClass = 'AjaxLightboxImgCommentComments';
var lboxFormCommentsClass = 'AjaxLightboxImgCommentForm';
var lboxImgCommentsListClass = 'AjaxLightboxImgCommentlist';
var closeClass = "AjaxLightboxImgCommenyClose";
var prevClass = "AjaxLightboxImgCommenyPrev";
var nextClass = "AjaxLightboxImgCommenyNext";

var prev ='<a class="absAlicPrev" href="#"><span id="prev" class="'+prevClass+'"></span></a>';
var next ='<a class="absAlicNext" href="#"><span id="prev" class="'+nextClass+'"></span></a>';

var close ='<a class="absAlicClose" href="#"><span id="close" class="'+closeClass+'"></span></a>';
var clear ='<div class="clearAjaxLightboxImgComment"></div>';
var AjaxLightboxImgComment = '<div class="'+lboxClass+'"><div style="display:none;" class="'+lboxCtClass+'"></div></div>';	

var $ = jQuery.noConflict();
$( window ).resize(function() {
  if($('.'+lboxCtClass).length){
	setHeightElementy()
  }
});

function setAjaxLightboxImgComment(obj){
		$( "body" ).prepend(AjaxLightboxImgComment);
			if(obj.parent().parent('.gallery-item').length){
			 $('.'+lboxClass).prepend(prev);
			 $('.'+lboxClass).prepend(next);
			}
				
		var urlAttachment = obj.attr('href');
		var urlImg = obj.children('img').attr('src');
		var imgCt = '';
		var cmCt = '';
		var firstInGallery = obj.parent().parent().parent().find('.gallery-item:first-child a');
		var lastInGallery = obj.parent().parent().parent().find('.gallery-item:last-child a');

		createAjaxElement(urlImg);
		

		$('.'+lboxClass).click(function(){
			deleteAlic();
			return false;
			});
			
		
		$('.'+lboxCtClass).bind('click', function(event) {
				event.stopPropagation();
			if(event.target.id == 'close'){
				deleteAlic();
			}
			if(event.target.id == 'submit'){
			addCommentAction(urlImg);
				return false;
			}
			
			if(event.target.id == 'reply-title'){
				idE = $('#'+event.target.id);
				showHideForm(idE);
				
				$( "#cancel-comment-reply-link" ).click(function() {
					hideForm();
				});
				return false;
			}

			
		});
		$('.'+prevClass).bind('click', function(event) {
				event.stopPropagation();
				var current = obj.parent().parent('.gallery-item');
				var next = current.prev().find('a');
				if(next.length > 0){
				
				$('.'+lboxCtClass).fadeOut('fast',function(){
					deleteAlic();
					setAjaxLightboxImgComment(next);
				});
				
				
				} else{
				var next = lastInGallery;
				$('.'+lboxCtClass).fadeOut('fast',function(){
					deleteAlic();
					setAjaxLightboxImgComment(next);
				});
				}
		});
	
				$('.'+nextClass).bind('click', function(event) {
				event.stopPropagation();
				var current = obj.parent().parent('.gallery-item');
				var next = current.next().find('a');
				if(next.length > 0){
				$('.'+lboxCtClass).fadeOut('fast',function(){
					deleteAlic();
					setAjaxLightboxImgComment(next);
				});
				} else{
				var next = firstInGallery;
			$('.'+lboxCtClass).fadeOut('500',function(){
					deleteAlic();
					setAjaxLightboxImgComment(next);
				});
				}
		});
		



		
}

function deleteAlic(){

	$('.'+lboxClass).remove();
}

function createAjaxElement(urlImg){

		   $.ajax({
            type: "POST",
            url: alic_ajax_admin.ajax_url,
            data: {
				action: 'alic_getAttachment',
				fkName: 'getAttachment',
				src: urlImg
            },
            success: function(msg) {
               console.log(msg);
				var obj = $.parseJSON(msg);
				console.log(obj);
				imgCt = '<div class="'+lboxImgClass+'"><div><div class="'+lboxImgClass+'-ct"><img src="'+obj.imgUrl+'" /></div></div></div>';
				cmCt = '<div style="display:none" class="'+lboxImgCommentsClass+'">'+obj.Cmt+'<div class="'+lboxImgCommentsListClass+'"></div</div>';
				createAjaxForm(urlImg);
				$('.'+lboxCtClass ).append(imgCt);
				$('.'+lboxCtClass ).append(cmCt);
				$('.'+lboxCtClass ).append(close);
				$('.'+lboxCtClass ).append(clear);
				
				showListComments(urlImg);
				
				$('.'+lboxCtClass).fadeIn('fast');
				$('.'+lboxImgCommentsClass).fadeIn('slow');
				setHeightElementy();
            }
        }); // Ajax Call

}

function createAjaxForm(urlImg){
$('.'+lboxFormCommentsClass).remove();
 $.ajax({
            type: "POST",
            url:  alic_ajax_admin.ajax_url,
            data: {
				action: 'alic_getCommentForm',
				fkName: 'getCommentForm',
				src: urlImg
            },
            success: function(msg) {
			//	alert(msg);

				$('.'+lboxImgCommentsClass ).append('<div class="'+lboxFormCommentsClass+'">'+msg+'</div>');
				$('#commentform').hide();
            }
        }); // Ajax Call

}

function showListComments(urlImg){
 $.ajax({
            type: "POST",
             url:  alic_ajax_admin.ajax_url,
            data: {
			action: 'alic_getCommentsList',
				fkName: 'getCommentsList',
				src: urlImg
            },
            success: function(msg) {
			//alert(msg);
			$('.'+lboxImgCommentsListClass).append(msg);
			//	$('.'+lboxImgCommentsClass ).append('<div class="'+lboxFormCommentsClass+'">'+msg+'</div>');
			//	showHideForm($('#reply-title'));
            }
        }); // Ajax Call

}

function addCommentAction(urlImg){
	$('.errorAlic').remove();
	var urlFile = $("."+lboxClass+" form").attr("action")
	var author = $('input#author').val();
	var email = $('input#email').val();
	var url = $('input#url').val();
	var comment = $('textarea#comment').val();
	var commentPostID = $('input#comment_post_ID').val();
	var commentParent = $('input#comment_parent').val();
	var msg = '';
	
var request = $.ajax({
            type: "POST",
            url: urlFile,
            data: {
				author: author,
				email: email,
				url: url,
				comment: comment,
				comment_post_ID: commentPostID,
				comment_parent: commentParent,
            }
        });
		request.done(function(msg ) {
					found = 'good';
			var elements = $(msg);
			parser = new DOMParser();
			doc = parser.parseFromString(msg, "text/html");
			error = doc.getElementById('error-page');
			if(error && error !=null && error != ''){
				found =error.innerHTML;
				$('.'+lboxFormCommentsClass ).append('<div class="errorAlic">'+found+'</div>');                
                    var $target = $('.errorAlic' );
                    $target.delay(2000).fadeOut('1000', function() {
                        $target.remove();
                    });
			} else {
			//msg= doc.getElementsByClassName("comment-list");
			$('.'+lboxImgCommentsListClass+' .comment-list').remove();
			showListComments(urlImg);
			createAjaxForm(urlImg);

			}
		});
		request.fail(function( jqXHR, textStatus ) {
			parser = new DOMParser();
			doc = parser.parseFromString(jqXHR.responseText, "text/html");
			error = doc.getElementById('error-page');
			if(error && error !=null && error != ''){
				found =error.innerHTML;
				$('.'+lboxFormCommentsClass ).append('<div class="errorAlic">'+found+'</div>');                
                    var $target = $('.errorAlic' );
                    $target.delay(3000).fadeOut('2000', function() {
                        $target.remove();
                    });
			}
		});

}

function showHideForm(obj){
				if(obj.hasClass('active')){
				obj.next().slideUp('fast');
				//$('.'+lboxFormCommentsClass+' form').slideUp();
				obj.removeClass('active');
				}else{
				obj.next().slideDown('fast');
				//$('.'+lboxFormCommentsClass+' form').slideDown();
				obj.addClass('active');
				}

}

function hideForm(){

				$('#commentform').hide();
				//$('.'+lboxFormCommentsClass+' form').slideUp();
				$('#reply-title').removeClass('active');
}

function setHeightElementy(){

	var  winHeight = $(window).innerHeight();
	var  winWidth = viewportW();

	var  bodyHeight = $('body').innerHeight();
	var titH = $('.AjaxLightboxImgCommentTitle').innerHeight();
	var lBoxWidth = $('.AjaxLightboxImgCommentImage').innerWidth();
	
	var margin = winHeight*0.15/2;
	var height = winHeight*0.85;
	var listH = height - titH - 60;
	var heightImgMob = height*0.4;
	var heightTextMob = height*0.6;
	var minHeightLarge = 400;
	var minListHeightLarge = minHeightLarge - titH - 60;
	var listHMob =  heightTextMob  - titH - 60;

	if( winWidth > 767 &&  winHeight > 500){
		$('.'+lboxCtClass).css('height', height+'px' );
		$('.'+lboxCtClass).css('margin', margin+'px auto' );
		$('.AjaxLightboxImgCommentImage').css('height', height+'px');
		$('.AjaxLightboxImgCommentImage-ct').css('height', height+'px');
		$('.AjaxLightboxImgCommentlist').css('height',listH+'px');
		$('.AjaxLightboxImgCommentImage > div img').css('max-width', lBoxWidth+'px');
		$('.AjaxLightboxImgCommentImage > div').css('width', lBoxWidth+'px');
		
		$('.AjaxLightboxImgCommentComments').css('height',height+'px');
	} else if( winWidth <= 767 && winHeight > 500){
	    $('.'+lboxCtClass).css('height', height+'px' );
		$('.'+lboxCtClass).css('margin', margin+'px auto' );
	    $('.AjaxLightboxImgCommentImage').css('height', heightImgMob+'px');
		$('.AjaxLightboxImgCommentImage-ct').css('height', heightImgMob+'px');
		$('.AjaxLightboxImgCommentComments').css('height',heightTextMob+'px');
		$('.AjaxLightboxImgCommentlist').css('height',listHMob+'px');
			$('.AjaxLightboxImgCommentImage > div img').css('max-width', lBoxWidth+'px');
		$('.AjaxLightboxImgCommentImage > div').css('width', lBoxWidth+'px');
	} else if( winHeight < 500 ){
		$('.'+lboxCtClass).css('height', height+'px' );
		$('.'+lboxCtClass).css('margin', margin+'px auto' );
		$('.AjaxLightboxImgCommentImage').css('height', height+'px');
		$('.AjaxLightboxImgCommentImage-ct').css('height', height+'px');
		$('.AjaxLightboxImgCommentImage > div img').css('max-width', lBoxWidth+'px');
		$('.AjaxLightboxImgCommentImage > div').css('width', lBoxWidth+'px');


	}
}

function viewportW() {
    var e = window, a = 'inner';
    if (!('innerWidth' in window )) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return e[ a+'Width' ] 
}
