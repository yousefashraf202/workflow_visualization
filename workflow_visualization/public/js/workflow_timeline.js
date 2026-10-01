// Workflow Timeline Visualizer - Workflow Visualization

function load_workflow_timeline(frm) {
	if (!frm || !frm.doc || frm.doc.__islocal) {
		if (frm) {
			remove_workflow_timeline(frm);
		}
		return;
	}

	frappe.call({
		method: "workflow_visualization.api.workflow_timeline.get_workflow_timeline_data",
		args: {
			doctype: frm.doctype,
			docname: frm.doc.name
		},
		callback: function (r) {
			if (
				!window.cur_frm ||
				cur_frm.doctype !== frm.doctype ||
				cur_frm.doc.name !== frm.doc.name
			) {
				return;
			}

			if (r.message && r.message.has_workflow) {
				render_workflow_timeline(frm, r.message);
			} else {
				remove_workflow_timeline(frm);
			}
		}
	});
}


// Frappe fires form-refresh before the complete form/dashboard render.
// Delay our timeline until Frappe finishes rendering.
$(document).on("form-refresh.workflow_visualization", function (event, frm) {

	setTimeout(function () {

		if (
			window.cur_frm &&
			cur_frm.doctype === frm.doctype &&
			cur_frm.doc.name === frm.doc.name
		) {
			load_workflow_timeline(frm);
		}

	}, 500);

});


function remove_workflow_timeline(frm) {
	if (frm.layout && frm.layout.wrapper) {
		frm.layout.wrapper.find(".workflow-timeline-wrapper").remove();
	}
}

function render_workflow_timeline(frm, data) {
	remove_workflow_timeline(frm);

	const nodes = Array.isArray(data.nodes) ? data.nodes : [];
	const edges = Array.isArray(data.edges) ? data.edges : [];
	if (!nodes.length) return;

	const escape_html = (value) =>
		frappe.utils.escape_html(String(value == null ? "" : value));
	const current_node =
		nodes.find((node) => node.id === data.current_state) ||
		nodes.find((node) => node.status === "current") ||
		nodes[nodes.length - 1];
	const current_index = Math.max(
		0,
		nodes.findIndex((node) => node.id === current_node.id)
	);
	const completed_count = nodes.filter((node) => node.status === "approved").length;
	const progress = nodes.length === 1
		? 100
		: Math.round((current_index / (nodes.length - 1)) * 100);
	const step_text = __("Step {0} of {1}", [current_index + 1, nodes.length]);

	const $wrapper = $(`
		<section class="workflow-timeline-wrapper" aria-label="${escape_html(__("Workflow Transition Path"))}">
			<header class="workflow-timeline-header">
				<div class="workflow-timeline-identity">
					<div class="workflow-timeline-icon" aria-hidden="true">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
							<circle cx="5" cy="12" r="2.25"></circle>
							<circle cx="19" cy="6" r="2.25"></circle>
							<circle cx="19" cy="18" r="2.25"></circle>
							<path d="M7.25 12h3.2c3.15 0 3.05-6 6.3-6M10.45 12c3.15 0 3.05 6 6.3 6"></path>
						</svg>
					</div>
					<div class="workflow-timeline-heading">
						<div class="workflow-timeline-title-row">
							<h4>${escape_html(__("Workflow Transition Path"))}</h4>
						</div>
						<p dir="auto" title="${escape_html(data.workflow_name)} · ${escape_html(frm.doc.name)}">
							${escape_html(data.workflow_name)} · ${escape_html(frm.doc.name)}
						</p>
					</div>
				</div>

				<div class="workflow-timeline-summary">
					<div class="workflow-summary-copy">
						<span>${escape_html(step_text)}</span>
						<strong dir="auto" title="${escape_html(current_node.label)}">${escape_html(current_node.label)}</strong>
					</div>
					<div class="workflow-summary-count">
						<strong>${completed_count}</strong>
						<span>${escape_html(__("completed"))}</span>
					</div>
				</div>
			</header>

			<div class="workflow-progress-track" aria-label="${escape_html(__("Workflow progress"))}">
				<span style="width: ${progress}%"></span>
			</div>

			<div class="workflow-timeline-toolbar">
				<div class="workflow-timeline-legend" aria-label="${escape_html(__("Workflow status legend"))}">
					<span><i class="wf-legend-node completed"></i>${escape_html(__("Completed"))}</span>
					<span><i class="wf-legend-node current"></i>${escape_html(__("Current"))}</span>
					<span><i class="wf-legend-node future"></i>${escape_html(__("Future"))}</span>
					<span><i class="wf-legend-route rejected"></i>${escape_html(__("Returned"))}</span>
					<span><i class="wf-legend-route reapproved"></i>${escape_html(__("Reapproval"))}</span>
				</div>
				<div class="workflow-scroll-hint">
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M3 12h18"></path>
					</svg>
					${escape_html(__("Scroll to explore"))}
				</div>
			</div>

			<div class="workflow-timeline-canvas-container" tabindex="0" aria-label="${escape_html(__("Workflow diagram. Scroll horizontally to explore every state."))}">
				<svg class="workflow-timeline-svg" role="img"></svg>
			</div>
		</section>
	`);

	if (frm.dashboard && frm.dashboard.wrapper) {
		frm.dashboard.wrapper.after($wrapper);
	} else {
		frm.layout.wrapper.prepend($wrapper);
	}

	const svg = $wrapper.find(".workflow-timeline-svg")[0];
	draw_timeline_svg(svg, nodes, edges, current_node.id);

	requestAnimationFrame(function () {
		const container = $wrapper.find(".workflow-timeline-canvas-container")[0];
		const active_node = svg.querySelector(".wf-node.is-current");
		if (!container || !active_node || container.scrollWidth <= container.clientWidth) return;

		const active_x = Number(active_node.getAttribute("data-x")) || 0;
		container.scrollLeft = Math.max(
			0,
			active_x - container.clientWidth / 2
		);
	});
}

function draw_timeline_svg(svg, nodes, edges, current_state) {
	const escape_html = (value) =>
		frappe.utils.escape_html(String(value == null ? "" : value));
	const clamp = (minimum, maximum, value) =>
		Math.max(minimum, Math.min(maximum, value));
	const integer = (value, fallback) => {
		const parsed = Number.parseInt(value, 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
	};
	const has_rtl_text = (value) =>
		/[\u0590-\u08ff\ufb1d-\ufdff\ufe70-\ufefc]/.test(value || "");
	const allowed_node_status = ["approved", "current", "final_target", "future"];
	const allowed_edge_status = ["approved", "reapproved", "pending_active", "rejected", "future"];
	const card_width = 154;
	const card_height = 76;
	const current_panel_gap = 7;
	const current_panel_height = 48;
	const padding_x = 96;
	const lane_gap = 54;

	function status_of(node) {
		return allowed_node_status.includes(node.status) ? node.status : "future";
	}

	function is_current(node) {
		return status_of(node) === "current" || node.id === current_state;
	}

	function radius_of(node) {
		return is_current(node) ? 17 : 14;
	}

	function label_width(node) {
		const label = String(node.label || node.id || "");
		const unit = has_rtl_text(label) ? 7.1 : 6.3;
		return clamp(108, 168, Array.from(label).length * unit);
	}

	function short_text(value, limit) {
		const characters = Array.from(String(value || ""));
		return characters.length > limit
			? `${characters.slice(0, limit - 1).join("")}…`
			: characters.join("");
	}

	const node_lookup = new Map();
	nodes.forEach((node, index) => node_lookup.set(node.id, { node, index }));

	const coordinates = new Map();
	let x = padding_x;
	nodes.forEach((node, index) => {
		if (index > 0) {
			const left_width = label_width(nodes[index - 1]);
			const right_width = label_width(node);
			x += clamp(188, 224, (left_width + right_width) / 2 + 60);
		}
		coordinates.set(node.id, { x, index, node });
	});

	const returned_edges = [];
	const pass_numbers = [];
	edges.forEach((edge, index) => {
		const source = node_lookup.get(edge.from);
		const target = node_lookup.get(edge.to);
		if (!source || !target) return;

		const pass = integer(edge.pass_index, 1);
		const returned = Boolean(
			edge.is_arc ||
			edge.status === "rejected" ||
			source.index > target.index
		);

		if (returned) {
			returned_edges.push({
				edge,
				order: integer(edge.rejection_index, index + 1),
				index
			});
		} else if (pass > 1 && !pass_numbers.includes(pass)) {
			pass_numbers.push(pass);
		}
	});

	returned_edges.sort((left, right) =>
		left.order - right.order || left.index - right.index
	);
	pass_numbers.sort((left, right) => left - right);

	const returned_lane = new Map();
	returned_edges.forEach((item, index) =>
		returned_lane.set(item.edge, index + 1)
	);
	const pass_lane = new Map();
	pass_numbers.forEach((pass, index) => pass_lane.set(pass, index + 1));

	const main_y = 66 + returned_edges.length * lane_gap;
	const card_top = main_y + 32;
	const has_current_panel = nodes.some((node) => is_current(node));
	const cards_bottom =
		card_top +
		card_height +
		(has_current_panel ? current_panel_gap + current_panel_height : 0);
	const lower_lane_start = cards_bottom + 27;
	const natural_width = x + padding_x;
	const svg_width = Math.max(520, natural_width);
	const center_offset = Math.max(0, (svg_width - natural_width) / 2);

	coordinates.forEach((coordinate) => {
		coordinate.x += center_offset;
		coordinate.y = main_y;
	});

	const svg_height = pass_numbers.length
		? lower_lane_start + (pass_numbers.length - 1) * lane_gap + 48
		: cards_bottom + 24;

	svg.setAttribute("width", svg_width);
	svg.setAttribute("height", svg_height);
	svg.setAttribute("viewBox", `0 0 ${svg_width} ${svg_height}`);
	svg.setAttribute("aria-label", __("Workflow transition path"));

	draw_timeline_svg.render_count = (draw_timeline_svg.render_count || 0) + 1;
	const id_prefix = `desk-wf-${draw_timeline_svg.render_count}`;
	const colors = {
		approved: "#169b62",
		reapproved: "#1687a7",
		pending_active: "#d8870b",
		rejected: "#d94f5c",
		future: "#98a2b3"
	};

	let definitions = "<defs>";
	Object.keys(colors).forEach((status) => {
		definitions += `
			<marker id="${id_prefix}-${status}" viewBox="0 0 10 10" refX="8.2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
				<path d="M 0 0 L 10 5 L 0 10 z" fill="${colors[status]}"></path>
			</marker>
		`;
	});
	definitions += `
		<filter id="${id_prefix}-shadow" x="-30%" y="-30%" width="160%" height="160%">
			<feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#0f172a" flood-opacity="0.14"></feDropShadow>
		</filter>
	</defs>`;

	let background_layer = `
		<rect class="wf-primary-band" x="18" y="${main_y - 30}" width="${svg_width - 36}" height="${card_height + 98}" rx="18"></rect>
		<text class="wf-band-label" x="34" y="${main_y - 10}">${escape_html(__("PRIMARY FLOW"))}</text>
	`;

	function rail_status(source_node, target_node) {
		const source_status = status_of(source_node);
		const target_status = status_of(target_node);
		if (
			source_status === "approved" &&
			["approved", "current"].includes(target_status)
		) {
			return "approved";
		}
		if (is_current(source_node)) return "pending_active";
		return "future";
	}

	let rail_layer = "";
	for (let index = 0; index < nodes.length - 1; index += 1) {
		const source = coordinates.get(nodes[index].id);
		const target = coordinates.get(nodes[index + 1].id);
		const status = rail_status(source.node, target.node);
		rail_layer += `
			<path
				class="wf-primary-rail ${status}"
				d="M ${source.x + radius_of(source.node) + 6} ${main_y} L ${target.x - radius_of(target.node) - 7} ${main_y}"
				marker-end="url(#${id_prefix}-${status})"
			></path>
		`;
	}

	function loop_path(source, target, lane_y, above) {
		const direction = target.x >= source.x ? 1 : -1;
		const shoulder = clamp(22, 36, Math.abs(target.x - source.x) * 0.18);
		const source_y = main_y + (above ? -1 : 1) * (radius_of(source.node) + 3);
		const target_y = main_y + (above ? -1 : 1) * (radius_of(target.node) + 3);
		const curve_y = lane_y + (above ? 22 : -22);

		return [
			`M ${source.x} ${source_y}`,
			`C ${source.x} ${curve_y}, ${source.x + direction * 8} ${lane_y}, ${source.x + direction * shoulder} ${lane_y}`,
			`L ${target.x - direction * shoulder} ${lane_y}`,
			`C ${target.x - direction * 8} ${lane_y}, ${target.x} ${curve_y}, ${target.x} ${target_y}`
		].join(" ");
	}

	function transition_title(edge, status) {
		const labels = {
			approved: __("Completed transition"),
			reapproved: __("Reapproval transition"),
			pending_active: __("Active transition"),
			rejected: __("Returned transition"),
			future: __("Future transition")
		};
		return [
			`${edge.from} → ${edge.to}`,
			labels[status],
			edge.duration || ""
		].filter(Boolean).join(" · ");
	}

	function route_badge(text, x_position, y_position, status) {
		const width = clamp(48, 126, Array.from(text).length * 5.7 + 22);
		return `
			<g class="wf-route-badge ${status}" transform="translate(${x_position - width / 2}, ${y_position - 10})">
				<rect width="${width}" height="20" rx="10"></rect>
				<text x="${width / 2}" y="10" direction="${has_rtl_text(text) ? "rtl" : "ltr"}" unicode-bidi="plaintext">${escape_html(text)}</text>
			</g>
		`;
	}

	let edge_layer = "";
	edges.forEach((edge) => {
		const source = coordinates.get(edge.from);
		const target = coordinates.get(edge.to);
		if (!source || !target) return;

		const status = allowed_edge_status.includes(edge.status)
			? edge.status
			: "future";
		const pass = integer(edge.pass_index, 1);
		const return_lane = returned_lane.get(edge);
		const lower_lane = pass_lane.get(pass);
		const direction = target.x >= source.x ? 1 : -1;
		let route = "primary";
		let path = "";
		let badge_y = main_y - 24;
		let badge_text = edge.duration || "";

		if (return_lane) {
			route = "returned";
			const lane_y = main_y - return_lane * lane_gap;
			path = loop_path(source, target, lane_y, true);
			badge_y = lane_y - 17;
			badge_text = edge.duration
				? `${__("Return")} ${return_lane} · ${edge.duration}`
				: `${__("Return")} ${return_lane}`;
		} else if (lower_lane) {
			route = "reapproval";
			const lane_y = lower_lane_start + (lower_lane - 1) * lane_gap;
			path = loop_path(source, target, lane_y, false);
			badge_y = lane_y + 17;
			badge_text = edge.duration
				? `${__("Pass")} ${pass} · ${edge.duration}`
				: `${__("Pass")} ${pass}`;
		} else {
			path = `M ${source.x + direction * (radius_of(source.node) + 5)} ${main_y} L ${target.x - direction * (radius_of(target.node) + 7)} ${main_y}`;
		}

		const title = escape_html(transition_title(edge, status));
		edge_layer += `
			<g
				class="wf-edge wf-route-${route} ${status}"
				data-from="${escape_html(edge.from)}"
				data-to="${escape_html(edge.to)}"
				tabindex="0"
				role="group"
				aria-label="${title}"
			>
				<title>${title}</title>
				<path class="wf-edge-hit" d="${path}"></path>
				<path class="wf-edge-line" d="${path}" marker-end="url(#${id_prefix}-${status})"></path>
				${badge_text ? route_badge(badge_text, (source.x + target.x) / 2, badge_y, status) : ""}
			</g>
		`;
	});

	const status_labels = {
		approved: __("Completed"),
		current: __("Current state"),
		final_target: __("Final destination"),
		future: __("Upcoming")
	};

	let node_layer = "";
	nodes.forEach((node, index) => {
		const coordinate = coordinates.get(node.id);
		const status = status_of(node);
		const current = is_current(node);
		const radius = radius_of(node);
		const label = String(node.label || node.id || "");
		const owner = String(node.user || "");
		const direction = has_rtl_text(label) ? "rtl" : "ltr";
		const state_label = current ? __("Current state") : status_labels[status];
		const current_age = node.duration
			? __("Waiting {0}", [node.duration])
			: __("Current stage");
		const current_note = owner
			? __("Last activity by {0}", [owner])
			: __("Waiting for the next workflow action");
		const foreign_height = current
			? card_height + current_panel_gap + current_panel_height
			: card_height;
		const tooltip = [
			label,
			owner ? `— ${owner}` : "",
			node.timestamp ? `(${node.timestamp})` : ""
		].filter(Boolean).join(" ");
		const step_number = String(index + 1).padStart(2, "0");
		let node_symbol = `<text class="wf-node-number" x="${coordinate.x}" y="${main_y + 0.5}">${index + 1}</text>`;

		if (status === "approved" && !current) {
			node_symbol = `
				<path
					class="wf-node-check"
					d="M ${coordinate.x - 5.5} ${main_y} L ${coordinate.x - 1.5} ${main_y + 4} L ${coordinate.x + 6} ${main_y - 5}"
				></path>
			`;
		} else if (status === "final_target") {
			node_symbol = `<circle class="wf-node-target" cx="${coordinate.x}" cy="${main_y}" r="4"></circle>`;
		}

		node_layer += `
			<g
				class="wf-node ${status}${current ? " is-current" : ""}"
				data-node="${escape_html(node.id)}"
				data-x="${coordinate.x}"
				tabindex="0"
				role="group"
				aria-label="${escape_html(tooltip)}"
			>
				<title>${escape_html(tooltip)}</title>
				<line class="wf-node-stem" x1="${coordinate.x}" y1="${main_y + radius}" x2="${coordinate.x}" y2="${card_top}"></line>
				<circle class="wf-node-hit" cx="${coordinate.x}" cy="${main_y}" r="25"></circle>
				${current ? `<circle class="wf-current-halo" cx="${coordinate.x}" cy="${main_y}" r="${radius + 7}"></circle>` : ""}
				<circle class="wf-node-circle" cx="${coordinate.x}" cy="${main_y}" r="${radius}"></circle>
				${node_symbol}

				<foreignObject
					class="wf-state-foreign"
					x="${coordinate.x - card_width / 2}"
					y="${card_top}"
					width="${card_width}"
					height="${foreign_height}"
				>
					<div xmlns="http://www.w3.org/1999/xhtml" class="wf-state-stack" dir="${direction}">
						<div class="wf-state-card ${status}${current ? " is-current" : ""}">
							<div class="wf-state-card-top">
								<span class="wf-state-kicker">${escape_html(state_label)}</span>
								<span class="wf-state-step">${step_number}</span>
							</div>
							<div class="wf-state-label" title="${escape_html(label)}">${escape_html(label)}</div>
							${owner ? `
								<div class="wf-state-owner" title="${escape_html(owner)}">
									<span class="wf-owner-avatar">${escape_html(Array.from(owner.trim())[0] || "•")}</span>
									<span>${escape_html(short_text(owner, 28))}</span>
								</div>
							` : `<div class="wf-state-owner is-empty">${escape_html(__("Awaiting action"))}</div>`}
						</div>

						${current ? `
							<div class="wf-current-context">
								<div class="wf-current-context-row">
									<span class="wf-aging-badge" dir="auto">
										<svg viewBox="0 0 24 24" aria-hidden="true">
											<circle cx="12" cy="12" r="8"></circle>
											<path d="M12 7v5l3 2"></path>
										</svg>
										${escape_html(current_age)}
									</span>
									${owner ? `<span class="wf-context-avatar">${escape_html(Array.from(owner.trim())[0] || "•")}</span>` : ""}
								</div>
								<div class="wf-current-context-note" dir="auto" title="${escape_html(current_note)}">
									${escape_html(short_text(current_note, 38))}
								</div>
							</div>
						` : ""}
					</div>
				</foreignObject>
			</g>
		`;
	});

	svg.innerHTML =
		definitions +
		background_layer +
		rail_layer +
		edge_layer +
		node_layer;

	const $svg = $(svg);

	function clear_focus() {
		$svg.removeClass("wf-focus-mode");
		$svg.find(".wf-highlight").removeClass("wf-highlight");
	}

	function highlight_node(node_id) {
		$svg.find(".wf-node").each(function () {
			if ($(this).attr("data-node") === node_id) {
				$(this).addClass("wf-highlight");
			}
		});
	}

	function focus_edge($edge) {
		clear_focus();
		$svg.addClass("wf-focus-mode");
		$edge.addClass("wf-highlight");
		highlight_node($edge.attr("data-from"));
		highlight_node($edge.attr("data-to"));
	}

	function focus_node($node) {
		clear_focus();
		const node_id = $node.attr("data-node");
		$svg.addClass("wf-focus-mode");
		$node.addClass("wf-highlight");

		$svg.find(".wf-edge").each(function () {
			const $edge = $(this);
			if (
				$edge.attr("data-from") === node_id ||
				$edge.attr("data-to") === node_id
			) {
				$edge.addClass("wf-highlight");
				highlight_node($edge.attr("data-from"));
				highlight_node($edge.attr("data-to"));
			}
		});
	}

	$svg.find(".wf-edge")
		.on("mouseenter focusin", function () {
			focus_edge($(this));
		})
		.on("mouseleave focusout", clear_focus);

	$svg.find(".wf-node")
		.on("mouseenter focusin", function () {
			focus_node($(this));
		})
		.on("mouseleave focusout", clear_focus);

	$svg.on("mouseleave", clear_focus);
}
