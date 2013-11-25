(function($){
	$.youtube = function(options) {
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
		options = $.extend(defaults, options);

		// Set the base urls for the playlists and videos
		var urls = {
			user_uploads: options.api_base_url + '/users/' + options.user + '/uploads',
			user_playlists: options.api_base_url + '/users/' + options.user + '/playlists',
			playlist_videos: options.api_base_url + '/playlists/'
		}

		// Globally set the object for the pagination
		var next_link = $(options.next_link);
		var prev_link = $(options.prev_link);

		// This is the templating system - taken from https://github.com/trix/nano
		var nano = function(template, data) {
			return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
			var keys = key.split("."), v = data[keys.shift()];
			for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
			return (typeof v !== "undefined" && v !== null) ? v : "";
			});
		}
		// /end templating system

		// Both the playlists and filtering had similar functionality
		var aside_links = function(self, container, selected_element) {
			options.index_count = 1;
			options.page_number = 1;

			self.parents(container).find(selected_element).removeClass(options.selected_class);
			self.addClass(options.selected_class);

			return self.attr('href').replace(/#/,'');
		}

		/*
		*	Videos
		*/

		// Drawing the video thumbnails
		var draw_thumbs = function(data) {
			var container = $(options.video_container);
			container.fadeOut(500, function(){
				container.empty();
				$.each(data.data.items, function(index, val) {
					var video = (val.video)? val.video : val;
					container.append(nano(options.video_list_template, video)).fadeIn();
				});
			})
		}

		// Get the videos - if a playlist URL is provided, use that - if not assume uploads
		var get_videos = function(url) {
			url = (url) ?  urls.playlist_videos + url : urls.user_uploads;
			$.ajax({
				url: url,
				data: {
					'v': options.api_version,
					'alt': options.format,
					'orderby': options.orderby,
					'start-index': options.index_count,
					'max-results': options.per_page
				}
			}).done(function(data) {
				draw_thumbs(data);
				pagination_visual(data);
			}).fail(function(data) {
				if(options.debug_errors) {
					console.log('get_videos error data:');
					console.log(data)
				}
			}).always(function(data) {
				if(options.debug_info) {
					console.log('get_videos data:');
					console.log(data)
				}
			});
		}

		/*
		*	Playlists
		*/

		// Draw the playlists using the template & add User Uploads to the beginning of array
		var draw_playlists = function(data) {
			data.data.items.unshift({
				id: '',
				title: options.uploads_title
			});
			$.each(data.data.items, function(index, val) {
				val.class = (val.id == options.current_playlist) ? options.selected_class : '';
				$(options.playlist_container).append(nano(options.playlist_template, val));
			});
		}

		var get_playlists = function(){
			$.ajax({
				url: urls.user_playlists,
				data: {
					'v': options.api_version,
					'alt': options.format,
					'orderby': options.orderby,
				},
			}).done(function(data) {
				draw_playlists(data);
			}).fail(function(data) {
				if(options.debug_errors) {
					console.log('get_playlists error data:');
					console.log(data)
				}
			}).always(function(data) {
				if(options.debug_info) {
					console.log('get_playlists data:');
					console.log(data)
				}
			});
		}

		$('body').on('click', options.playlist_container + ' a', function(e) {
			var link = aside_links($(this), options.playlist_container, options.playlist_selected_element);
			options.current_playlist = window.location.hash = link;
			get_videos(link);
			e.preventDefault();
		});

		/*
		*	Filtering
		*/

		// Draw the filtering options
		var draw_orderby = function() {
			var container = $(options.orderby_container)
			$.each(options.orderbys, function(index, val) {
				val.class = (val.order == options.orderby) ? options.selected_class : '';
				container.append(nano(options.orderby_template, val));
			});
		}

		// Not really needed - but added for consitency
		var get_orderbys = function() {
			draw_orderby();
		}

		// Filtering link action
		$('body').on('click', options.orderby_container + ' a', function(e) {
			options.orderby = aside_links($(this), options.orderby_container, options.orderby_selected_element);
			get_videos(options.current_playlist);
			e.preventDefault();
		});

		/*
		*	Pagination
		*/

		// Hides and shows pagination links
		var pagination_visual = function(data) {
			options.max_pages = Math.ceil(data.data.totalItems / options.per_page);
			if(options.page_number === options.max_pages)
				next_link.hide();
			else
				next_link.show();

			if(options.page_number === 1)
				prev_link.hide();
			else
				prev_link.show();
		}

		// Keeps track of page and paginates through playlists and uploads
		var pagination = function(operator) {
			options.index_count = eval(options.index_count + operator + options.per_page);
			if(operator == '+')
				options.page_number++;
			else
				options.page_number--;

			get_videos(options.playlist_link);
		}

		next_link.on('click', function(){
			pagination('+');
		});
		prev_link.on('click', function(){
			pagination('-');
		});

		/*
		* Initialisation
		*/

		// Get the three on first load
		get_videos(options.current_playlist);
		get_playlists();
		get_orderbys();
	};
})(jQuery);