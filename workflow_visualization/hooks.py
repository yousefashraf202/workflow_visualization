app_name = "workflow_visualization"
app_title = "Workflow Visualization"
app_publisher = "Yousef Ashraf"
app_description = "Workflow Visualization"
app_email = "yousefmohamed202@outlook.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "workflow_visualization",
# 		"logo": "/assets/workflow_visualization/logo.png",
# 		"title": "Workflow Visualization",
# 		"route": "/workflow_visualization",
# 		"has_permission": "workflow_visualization.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
app_include_css = "/assets/workflow_visualization/css/workflow_timeline.css"
app_include_js = "/assets/workflow_visualization/js/workflow_timeline.js"

# include js, css files in header of web template
# web_include_css = "/assets/workflow_visualization/css/workflow_visualization.css"
# web_include_js = "/assets/workflow_visualization/js/workflow_visualization.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "workflow_visualization/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "workflow_visualization/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "workflow_visualization.utils.jinja_methods",
# 	"filters": "workflow_visualization.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "workflow_visualization.install.before_install"
# after_install = "workflow_visualization.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "workflow_visualization.uninstall.before_uninstall"
# after_uninstall = "workflow_visualization.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "workflow_visualization.utils.before_app_install"
# after_app_install = "workflow_visualization.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "workflow_visualization.utils.before_app_uninstall"
# after_app_uninstall = "workflow_visualization.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "workflow_visualization.notifications.get_notification_config"

# Awesome Bar
# -----------
# Extra search results: list of dicts with label, description, route, index.
# route: ["List", "ToDo"], "/desk/docs/some/page", or "https://example.com"
# awesomebar_search = ["workflow_visualization.search.awesomebar_results"]

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"workflow_visualization.tasks.all"
# 	],
# 	"daily": [
# 		"workflow_visualization.tasks.daily"
# 	],
# 	"hourly": [
# 		"workflow_visualization.tasks.hourly"
# 	],
# 	"weekly": [
# 		"workflow_visualization.tasks.weekly"
# 	],
# 	"monthly": [
# 		"workflow_visualization.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "workflow_visualization.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "workflow_visualization.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "workflow_visualization.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["workflow_visualization.utils.before_request"]
# after_request = ["workflow_visualization.utils.after_request"]

# Job Events
# ----------
# before_job = ["workflow_visualization.utils.before_job"]
# after_job = ["workflow_visualization.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"workflow_visualization.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# Translation
# ------------
# List of apps whose translatable strings should be excluded from this app's translations.
# ignore_translatable_strings_from = []
