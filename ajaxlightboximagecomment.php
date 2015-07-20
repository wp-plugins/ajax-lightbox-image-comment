<?php

/**
 * Plugin Name: Ajax Lightbox Image Comment.
 * Description: Simply and fast add comments to your images gallery.
 * Version: 0.1 Beta
 * Author: Jakub Gądek
 * Author URI: http://alic.qboss-plugins.com/
 * License: GPL
 * Copyright: Jakub Gądek
 */
//SETUP
add_action('admin_menu', 'AjaxLightboxImgComment');

function AjaxLightboxImgComment()
{


    add_options_page('ALIC-settings', 'ALIC-settings', 'manage_options', 'ALIC', 'alic_init');
}

function alic_init()
{
    require('admin/admin.php');
}

/**
 * Include CSS and JS file for AjaxLightboxImgComment.
 */
function alic_style()
{
    wp_register_style('alic', plugin_dir_url(__FILE__) . 'css/alic.css');
    wp_enqueue_style('alic');
}

add_action('wp_enqueue_scripts', 'alic_style');

function alic_scripts()
{
    wp_enqueue_style('alic-js', get_stylesheet_uri());
    wp_enqueue_script('alic-js', plugin_dir_url(__FILE__) . 'js/alic.js', array(), '1.0.0', true);
    wp_localize_script('alic-js', 'alic_ajax_admin', array('ajax_url' => admin_url('admin-ajax.php')));
}

add_action('wp_enqueue_scripts', 'alic_scripts');

/**
 * Include php code to head.
 */
add_action('get_footer', 'hook_alic');

function hook_alic()
{
    $urlPlugin = plugin_dir_url(__FILE__);
    $output = "<script>";
    $output .= "var $ = jQuery.noConflict();";
    $output .= "$(document).ready(function(){";
    $output .= "$('.alic-comments a').click(function(event){";
    $output .= "event.preventDefault();";
    $output .= "obj = $(this);";
    $output .= "setAjaxLightboxImgComment(obj);";
    $output .= "});";
    $output .= "});";
    $output .= "</script>";
    echo $output;
}

/**
 * Ajax function to get attachment
 */
add_action('wp_ajax_nopriv_alic_getAttachment', 'alic_getAttachment');
add_action('wp_ajax_alic_getAttachment', 'alic_getAttachment');

function alic_getAttachment()
{
    $attachment_id = getAttachmentId($_POST['src']);
    $img = wp_get_attachment_image_src($attachment_id, 'full');
    $attachment = get_post($attachment_id);
    $comment_number = get_comments_number($attachment_id);

    $comment = '';
    if ($comment_number > 0) :
        $comment .= '<div class="AjaxLightboxImgCommentTitle"><h2 class="comments-title-alic">';
        $comment .= get_the_title($attachment_id) . ' (' . number_format_i18n($comment_number) . ')';
        $comment .= '</h2><p>' . $attachment->post_excerpt . '</p></div>';
    else:
        $comment .= '<div class="AjaxLightboxImgCommentTitle"><h2 class="comments-title-alic">';
        $comment .= get_the_title($attachment_id);
        $comment .= '</h2><p>' . $attachment->post_excerpt . '</p></div>';

    endif; // have_comments() 



    $data = array('imgUrl' => $img[0], 'Cmt' => $comment);
    echo json_encode($data);
    die();
}

/**
 * Ajax function to get Comment form
 */
add_action('wp_ajax_nopriv_alic_getCommentForm', 'alic_getCommentForm');
add_action('wp_ajax_alic_getCommentForm', 'alic_getCommentForm');

function alic_getCommentForm()
{
    $attachment_id = getAttachmentId($_POST['src']);

    if (!comments_open($attachment_id) && get_comments_number($attachment_id) && post_type_supports(get_post_type($attachment_id), 'comments')) :

        echo '<p class="no-comments">' . _e('Comments are closed.', 'twentyfifteen') . '</p>';
    else:
        $args = array();
        comment_form($args, $attachment_id);
    endif;
    die();
}

/**
 * Ajax function to get Comments list
 */
add_action('wp_ajax_nopriv_alic_getCommentsList', 'alic_getCommentsList');
add_action('wp_ajax_alic_getCommentsList', 'alic_getCommentsList');

function alic_getCommentsList()
{
    $attachment_id = getAttachmentId($_POST['src']);
    echo '<ol class="comment-list">';
    $args = array(
		'callback'=>'mytheme_comment',
        'style' => 'ol',
        'short_ping' => true,
            );
    $defaults = array(
        'post_id' => $attachment_id,
        'order' => 'ASC',
    );

    $comments = get_comments($defaults);
    wp_list_comments($args, $comments);

    echo '</ol>';
    die();
}

function getAttachmentId($attachment_url = '')
{
    global $wpdb;
    $attachment_id = false;

    // If there is no url, return.
    if ('' == $attachment_url)
        return;

    // Get the upload directory paths
    $upload_dir_paths = wp_upload_dir();

    // Make sure the upload path base directory exists in the attachment URL, to verify that we're working with a media library image
    if (false !== strpos($attachment_url, $upload_dir_paths['baseurl'])) {

        // If this is the URL of an auto-generated thumbnail, get the URL of the original image
        $attachment_url = preg_replace('/-\d+x\d+(?=\.(jpg|jpeg|png|gif)$)/i', '', $attachment_url);

        // Remove the upload path base directory from the attachment URL
        $attachment_url = str_replace($upload_dir_paths['baseurl'] . '/', '', $attachment_url);

        // Finally, run a custom database query to get the attachment ID from the modified attachment URL
        $attachment_id = $wpdb->get_var($wpdb->prepare("SELECT wposts.ID FROM $wpdb->posts wposts, $wpdb->postmeta wpostmeta WHERE wposts.ID = wpostmeta.post_id AND wpostmeta.meta_key = '_wp_attached_file' AND wpostmeta.meta_value = '%s' AND wposts.post_type = 'attachment'", $attachment_url));
    }

    return $attachment_id;
}
function mytheme_comment($comment, $args, $depth) {
	$GLOBALS['comment'] = $comment;
	extract($args, EXTR_SKIP);

	if ( 'div' == $args['style'] ) {
		$tag = 'div';
		$add_below = 'comment';
	} else {
		$tag = 'li';
		$add_below = 'div-comment';
	}
?>



	<<?php echo $tag ?> <?php comment_class( empty( $args['has_children'] ) ? '' : 'parent' ) ?> id="comment-<?php comment_ID() ?>">
	<?php if ( 'div' != $args['style'] ) : ?>
	<div id="div-comment-<?php comment_ID() ?>" class="alic-comment-body">
	<?php endif; ?>

	<div class="alic-comment-author alic-vcard">
	<div class="alic-v-left">
	<?php if ( $args['avatar_size'] != 0 ) echo get_avatar( $comment, $args['avatar_size'] ); ?>
		</div>
		<div class="alic-v-right">
		<?php printf( __( '<cite class="fn">%s</cite> <span class="says">says:</span>' ), get_comment_author_link() ); ?>
				<div class="alic-comment-meta alic-commentmetadata"><a href="<?php echo htmlspecialchars( get_comment_link( $comment->comment_ID ) ); ?>">
		<?php
			/* translators: 1: date, 2: time */
			printf( __('%1$s at %2$s'), get_comment_date(),  get_comment_time() ); ?></a><?php edit_comment_link( __( '(Edit)' ), '  ', '' );
		?>
		</div>
		</div>

	</div>
	<div class="alic-reply">
	<?php comment_reply_link( array_merge( $args, array( 'add_below' => $add_below, 'depth' => $depth, 'max_depth' => $args['max_depth'] ) ) ); ?>
	</div>

	<div class="alic-comment-right">
	<?php if ( $comment->comment_approved == '0' ) : ?>
		<em class="alic-comment-awaiting-moderation"><?php _e( 'Your comment is awaiting moderation.' ); ?></em>
		<br />
	<?php endif; ?>



	<?php comment_text(); ?>


	<?php if ( 'div' != $args['style'] ) : ?>
	</div>
	</div>
	<?php endif; ?>
<?php
}
