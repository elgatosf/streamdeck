import type { DidReceiveDeepLink } from "../../api";
import { Event } from "../../common/events";

/**
 * Event information received from Stream Deck as part of a deep-link message being routed to the plugin.
 */
export class DidReceiveDeepLinkEvent extends Event<DidReceiveDeepLink> {
	/**
	 * Deep-link URL routed from Stream Deck.
	 */
	public readonly url: DeepLinkURL;

	/**
	 * Initializes a new instance of the {@link DidReceiveDeepLinkEvent} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(source: DidReceiveDeepLink) {
		super(source);
		this.url = new DeepLinkURL(source.payload.url);
	}
}

const PREFIX = "streamdeck://";

/**
 * Provides information associated with a URL received as part of a deep-link message, conforming to the URI syntax defined within RFC-3986 (https://datatracker.ietf.org/doc/html/rfc3986#section-3).
 */
export class DeepLinkURL {
	/**
	 * Fragment of the URL, with the number sign (#) omitted. For example, a URL of "/test#heading" would result in a {@link DeepLinkURL.fragment} of "heading".
	 */
	public readonly fragment: string;

	/**
	 * Original URL. For example, a URL of "/test?one=two#heading" would result in a {@link DeepLinkURL.href} of "/test?one=two#heading".
	 */
	public readonly href: string;

	/**
	 * Path of the URL; the full URL with the query and fragment omitted. For example, a URL of "/test?one=two#heading" would result in a {@link DeepLinkURL.path} of "/test".
	 */
	public readonly path: string;

	/**
	 * Query of the URL, with the question mark (?) omitted. For example, a URL of "/test?name=elgato&key=123" would result in a {@link DeepLinkURL.query} of "name=elgato&key=123".
	 * Also see {@link DeepLinkURL.queryParameters}.
	 */
	public readonly query: string;

	/**
	 * Query string parameters parsed from the URL. Also see {@link DeepLinkURL.query}.
	 */
	public readonly queryParameters: URLSearchParams;

	/**
	 * Initializes a new instance of the {@link DeepLinkURL} class.
	 * @param url URL of the deep-link, with the schema and authority omitted.
	 */
	constructor(url: string) {
		const refUrl = new URL(`${PREFIX}${url}`);

		this.fragment = refUrl.hash.substring(1);
		this.href = refUrl.href.substring(PREFIX.length);
		this.path = DeepLinkURL.parsePath(this.href);
		this.query = refUrl.search.substring(1);
		this.queryParameters = refUrl.searchParams;
	}

	/**
	 * Parses the {@link DeepLinkURL.path} from the specified {@link href}.
	 * @param href Partial URL that contains the path to parse.
	 * @returns The path of the URL.
	 */
	private static parsePath(href: string): string {
		const indexOf = (char: string): number => {
			const index = href.indexOf(char);
			return index >= 0 ? index : href.length;
		};

		return href.substring(0, Math.min(indexOf("?"), indexOf("#")));
	}
}
