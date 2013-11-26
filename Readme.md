#Youtube Viewer

This takes a youtube user and builds up a channel right in the html. It includes users uploads, playlists and an order by selection. Viewing a playlist will change the URL and load that playlist when refreshed/opened in a new window.

To get the basics started, include `jquery` and `youtube.js` into your page.

Make your HTML look like the following:

	<!-- Where your 'sort by' optiosn will appear -->
	<ul data-role="playlist-order"></ul>

	<!-- Where your playlists will appear -->
	<ul data-role="playlists"></ul>

	<!-- Where videos will appear -->
	<ul data-role="videos"></ul>

	<!-- Pagination for the videos -->
	<a data-role="next-page">Next page</a>
	<a data-role="prev-page">Prev page</a>

Next, initialise youtube:

	$.youtube();

The youtube plugin takes many, many options - all of them overwriteable. Below are the defaults:

```js
var defaults = {
	user: 'mikestreety', // Youtube user

	index_count: 1, // What number video to start from
	per_page: 12, // How many videos per page
	page_number: 1, // What page number to start on
	max_pages: 2, // The maximum pages - this is used by the app

	video_container: 'ul[data-role="videos"]', // Where to put the videos
	playlist_container: 'ul[data-role="playlists"]', // Where to put the playlists
	orderby_container: 'ul[data-role="playlist-order"]', // Where to put the filtering

	next_link: 'a[data-role="next-page"]', // What is the next link
	prev_link: 'a[data-role="prev-page"]', // What is the prev page link
	pagination_effect: 'hide', // What to do to the pagination. Can be hide, fade or class
	pagination_effect_modifier: false, // If above is class or fade, what class to apply or fade duration

	// The templates for the vidoes, playlists and filters - enable debug_info to see what values you can have
	video_list_template: '<li><h3>{title}</h3><h4>{description}</h4><img src="{thumbnail.hqDefault}" alt="{title}"></li>',
	playlist_template: '<li><a class="{class}" href="#{id}">{title}</a></li>',
	orderby_template: '<li><a class="{class}" href="#{order}">{title}</a></li>',

	playlist_selected_element: 'a', // What element in the playlist template to apply the selected class to
	orderby_selected_element: 'a', // What element in the filter template to apply the selected class to

	uploads_title: 'All Uploads', // What link title the uploads playlist has
	orderby: 'published', // What sorting to use by default
	selected_class: 'selected', // The class which gets applied to a playlist/filter

	// Array of the filters
	orderbys: [
		{title: 'Date', order: 'published'},
		{title: 'View Count', order: 'viewCount'},
		{title: 'Title', order: 'title'},
	],

	// Dev debugging
	debug_info: false,
	debug_errors: false,

	// Dev variables - don't really need to be touched
	current_playlist: window.location.hash.replace(/#/,''),
	format: 'jsonc',
	api_version: 2,
	api_base_url: 'https://gdata.youtube.com/feeds/api'
}
```