(function($){
	$.youtube = function(options) {
		var defaults = {
			index_count: 1,
			per_page: 2,
			page_number: 1,
			max_pages: 2,

			video_container: 'ul[data-role="videos"]',
			playlist_container: 'ul[data-role="playlists"]',
			orderby_container: 'ul[data-role="playlist-order"]',
			next_link: 'span[data-role="next-page"]',
			prev_link: 'span[data-role="prev-page"]',

			playlist_selected_element: 'a',
			orderby_selected_element: 'a',

			video_list_template: '<li><h3>{title}</h3><h4>{description}</h4><img src="{thumbnail.hqDefault}" alt="{title}"></li>',
			playlist_template: '<li><a class="{class}" href="#{id}">{title}</a></li>',
			orderby_template: '<li><a class="{class}" href="#{order}">{title}</a></li>',

			uploads_title: 'All Uploads',
			orderby: 'published',
			selected_class: 'selected',
			user: 'mikestreety',

			orderbys: [
				{title: 'Date', order: 'published'},
				{title: 'View Count', order: 'viewCount'},
				{title: 'Title', order: 'title'},
			],

			debug_info: false,
			debug_errors: false,

			current_playlist: window.location.hash.replace(/#/,''),
			format: 'jsonc',
			api_version: 2,
			api_base_url: 'https://gdata.youtube.com/feeds/api'
		}
		options = $.extend(defaults, options);

		var urls = {
			user_uploads: options.api_base_url + '/users/' + options.user + '/uploads',
			user_playlists: options.api_base_url + '/users/' + options.user + '/playlists',
			playlist_videos: options.api_base_url + '/playlists/'
		}

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

		var draw_orderby = function() {
			var container = $(options.orderby_container)
			$.each(options.orderbys, function(index, val) {
				val.class = (val.order == options.orderby) ? options.selected_class : '';
				container.append(nano(options.orderby_template, val));
			});
		}

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

		var get_orderbys = function() {
			draw_orderby();
		}

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

		var pagination = function(operator) {
			options.index_count = eval(options.index_count + operator + options.per_page);
			if(operator == '+')
				options.page_number++;
			else
				options.page_number--;

			get_videos(options.playlist_link);
		}

		var aside_links = function(self, container, selected_element) {
			options.index_count = 1;
			options.page_number = 1;

			self.parents(container).find(selected_element).removeClass(options.selected_class);
			self.addClass(options.selected_class);

			return self.attr('href').replace(/#/,'');
		}

		$('body').on('click', options.playlist_container + ' a', function(e) {
			var link = aside_links($(this), options.playlist_container, options.playlist_selected_element);
			options.current_playlist = window.location.hash = link;
			get_videos(link);
			e.preventDefault();
		});
		$('body').on('click', options.orderby_container + ' a', function(e) {
			options.orderby = aside_links($(this), options.orderby_container, options.orderby_selected_element);
			get_videos(options.current_playlist);
			e.preventDefault();
		});

		next_link.on('click', function(){
			pagination('+');
		});
		prev_link.on('click', function(){
			pagination('-');
		});
		get_videos(options.current_playlist);
		get_playlists();
		get_orderbys();
	};
})(jQuery);