"""Integrate the approved HTML design exports into the storefront.

Run from any directory, passing the extracted standalone HTML exports.
Binary image conversion and HTML serialization are mechanical import steps.
"""
import argparse
import base64
import hashlib
import io
import re
from pathlib import Path
from urllib.parse import urlsplit

from lxml import etree, html
from PIL import Image


SCRIPTS = Path(__file__).resolve().parent
ROOT = SCRIPTS.parent / "public"
DESIGN = ROOT / "assets" / "client-design"
IMAGES = DESIGN / "images"
PREFIX = "/assets/client-design/"
DATA = re.compile(r"data:image/([\w.+-]+);base64,([A-Za-z0-9+/=]+)")
ROUTES = {
    "homepage": "/", "packaging": "/products/", "markets": "/markets/",
    "our_process": "/solutions/", "insights": "/blog/", "contact": "/contact/",
    "get_a_quote": "/inquiry/", "about_us": "/about-us/",
    "our_capabilities": "/solutions/", "sustainability": "/sustainability/",
    "gallery_and_design": "/products/", "faq": "/added-value/faq/",
}
FORMAT_SLUGS = {
    "stand-up": "stand-up-pouch", "flat-bottom": "flat-bottom-pouch",
    "quad-seal": "quad-seal-bag", "flat-pouch": "flat-pouch", "shaped": "shaped-pouch",
    "retort": "retort-pouch", "spout": "spout-pouch", "tap-pouch": "stand-up-pouch-tap",
    "bag-in-box": "bag-in-box", "rollstock": "roll-stock-films",
}


def external_image(match):
    kind, encoded = match.groups()
    data = base64.b64decode(encoded, validate=True)
    if kind == "svg+xml":
        svg = etree.fromstring(data, parser=etree.XMLParser(resolve_entities=False, no_network=True))
        for el in svg.iter():
            if not isinstance(el.tag, str):
                continue
            if etree.QName(el).localname in {"script", "foreignObject", "iframe", "object"}:
                raise ValueError("Unsupported active content in artwork")
            for name in el.attrib:
                attr = etree.QName(name).localname.lower()
                reference = el.attrib[name]
                embedded_raster = re.fullmatch(r"data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+", reference)
                if attr.startswith("on") or (attr in {"href", "src"} and not (reference.startswith("#") or embedded_raster)):
                    raise ValueError("Unsupported active reference in artwork")
        extension = "svg"
    else:
        with Image.open(io.BytesIO(data)) as original:
            image = original.convert("RGBA" if "A" in original.getbands() else "RGB")
            image.thumbnail((1600, 1600))
            output = io.BytesIO()
            image.save(output, format="WEBP", quality=82, method=4)
            data = output.getvalue()
        extension = "webp"
    key = hashlib.sha256(data).hexdigest()[:16] + "." + extension
    target = IMAGES / key
    if not target.exists():
        target.write_bytes(data)
    return PREFIX + "images/" + key


def local_link(href, page):
    if not href or href.startswith(("#", "mailto:", "tel:")):
        return href
    parts = urlsplit(href)
    if parts.hostname and parts.hostname.endswith(".wp.build"):
        return parts.path.rstrip("/") + "/"
    if parts.scheme or parts.netloc:
        return href
    if not parts.path.lower().endswith(".html"):
        return href
    name = Path(parts.path).name.lower().removeprefix("mewepak_")
    key = next((name_key for name_key in ROUTES if name.startswith(name_key)), None)
    if key is None:
        raise ValueError(f"Unmapped preview URL in {page}: {href}")
    path = ROUTES[key]
    # Match anchors on published design pages.
    if key == "gallery_and_design":
        return "/3d-preview/"
    if key == "our_capabilities":
        return "/solutions/#process-stages"
    fragment = "#" + parts.fragment if (key, parts.fragment) in {
        ("packaging", "formats"), ("packaging", "packaging-eco-guide"),
        ("get_a_quote", "quote-request"), ("get_a_quote", "materials"), ("get_a_quote", "artwork-preview"),
        ("our_process", "process-stages"), ("our_process", "project-enquiry"),
        ("contact", "project-enquiry"), ("markets", "markets"),
    } else ""
    return path + fragment


def append(el, markup):
    el.append(html.fragment_fromstring(markup))


def exactly(doc, path):
    matches = doc.xpath(path)
    if len(matches) != 1:
        raise ValueError(f"Expected one element: {path}; found {len(matches)}")
    return matches[0]


def review_submission(doc, prefix, button):
    review = exactly(doc, f'//*[@id="{prefix}-review"]')
    paragraph = review.xpath("./p")[0]
    paragraph.text = "Check your details, then send your request directly to the Mewepak team."
    email = exactly(doc, f'//*[@id="{prefix}-open-email"]')
    email.drop_tree()
    actions = review.xpath(f'./div[@class="{prefix}-review-actions"]')[0]
    append(actions, f'''<form data-mewepak-quote data-client-brief="{prefix}" action="/api/submissions/quote" method="post">
      <input type="hidden" name="name"><input type="hidden" name="company">
      <input type="hidden" name="email"><input type="hidden" name="quantity">
      <input type="hidden" name="product_type"><input type="hidden" name="product_context">
      <input type="hidden" name="details"><button type="submit" class="{button}">Send request ↗</button>
      <p data-quote-message class="client-message" aria-live="polite"></p>
    </form>''')


def newsletter(doc, element_id):
    form = exactly(doc, f'//*[@id="{element_id}"]')
    form.set("data-mewepak-subscribe", "")
    form.set("method", "post")
    form.set("action", "/api/submissions/newsletter")
    form.attrib.pop("hidden", None)
    append(form, '<p data-subscribe-message class="client-message" aria-live="polite"></p>')


def apply_site_shell(design):
    shell = html.parse(str(SCRIPTS / "templates" / "mewepak-site-shell.html")).getroot()
    head = exactly(shell, "//head")
    for element in design.xpath('//head/title|//head/meta[@name="description" or @name="robots"]|//head/link'):
        head.append(element)

    content = exactly(design, '//*[@id="mewepak-homepage"]')
    for element in content.xpath('./header|./footer|./div[@id="mw-top"]|./a[contains(@class,"-skip")]|./p[@id="mw-search-status"]'):
        element.drop_tree()

    main = exactly(content, './main')
    target = main.get("id") or "wp--skip-link--target"
    main.set("id", target)
    exactly(shell, '//*[@id="wp-skip-link"]').set("href", "#" + target)
    slot = exactly(shell, '//*[@data-client-content]')
    slot.getparent().replace(slot, content)

    body = exactly(shell, "//body")
    for element in design.xpath("//body/script"):
        if element.get("src") in (PREFIX + "home.js", PREFIX + "packaging.js", PREFIX + "integration.js"):
            element.set("src", element.get("src") + "?shell=1")
        body.append(element)
    return shell


PAGES = {
    "home": "/", "packaging": "/products/", "quote": "/inquiry/",
    "markets": "/markets/", "process": "/solutions/", "insights": "/blog/",
    "contact": "/contact/", "about": "/about-us/", "sustainability": "/sustainability/",
    "faq": "/added-value/faq/",
}

SECOND_PHASE_BRIEFS = {
    "markets": ("mk", "mk-btn"),
    "process": ("pr", "pr-btn"),
    "contact": ("ct", "ct-button"),
}

DRAFT_COPY = {
    "Check your brief, then open your email draft.": "Review your brief before sending it.",
    "Have artwork or reference photos? Attach them in your email app before sending.": "Mention any artwork or reference photos in your notes so our team can follow up.",
    "Have artwork or reference photos? Add the files to your email draft before sending.": "Mention any artwork or reference photos in your notes so our team can follow up.",
    "Review your details, then open your email draft to send your enquiry.": "Review your details before sending your enquiry.",
    "Review your details, then open an email draft.": "Review your details before sending your enquiry.",
    "Use the form to prepare your enquiry, review the details, then open your email draft. Attach artwork, photographs or reference files in your email app before sending.": "Use the form to prepare, review and send your enquiry. Mention any artwork or reference files in your notes.",
    "Please attach any artwork or reference photos before sending.": "Our team will follow up for artwork or reference photos.",
    "Please attach reference artwork or photos before sending.": "Our team will follow up for artwork or reference photos.",
}


def connect_additional_brief(doc, page, js):
    prefix, button = SECOND_PHASE_BRIEFS[page]
    review_submission(doc, prefix, button)
    form = exactly(doc, f'//*[@id="{prefix}-enquiry-form"]')
    company = form.xpath('.//input[@name="company"]')
    if not company:
        email = exactly(form, './/input[@name="email"]')
        email.getparent().addnext(html.fragment_fromstring(
            '<label><span>Company <em>*</em></span><input name="company" autocomplete="organization" required maxlength="160"></label>'
        ))
    elif page == "contact":
        # Keep the required company field visible outside the optional specifications panel.
        company[0].getparent().drop_tree()
        email = exactly(form, './/input[@name="email"]')
        email.getparent().addnext(html.fragment_fromstring(
            '<label><span>Company <em>*</em></span><input name="company" autocomplete="organization" required maxlength="160"></label>'
        ))
    else:
        company[0].set("required", "")
        exactly(company[0].getparent(), './span').text = "Company *"
        for note in company[0].getparent().xpath('./span/small'):
            note.drop_tree()

    if page == "contact":
        return re.sub(r"^.*(?:emailDraft|const subject = ).*\n", "", js, flags=re.M).replace(
            "    download.href =", "    window.mewepakClient.fillBrief('ct', data, body, show('format'));\n    download.href =",
        )
    if page == "process":
        js = js.replace("$('#pr-open-email').href='mailto:sales@mewepak.com';", "")
        js = re.sub(r"^.*pr-open-email.*\n", "", js, flags=re.M)
        js = js.replace("['Email',data.get('email').trim()]", "['Email',data.get('email').trim()],['Company',data.get('company').trim()]")
        return js.replace("  briefUrl=URL.createObjectURL", "  window.mewepakClient.fillBrief('pr', data, text);\n  briefUrl=URL.createObjectURL")

    js = re.sub(r"^.*(?:mk-open-email|mk-footer-search).*\n", "", js, flags=re.M)
    return js.replace("  root.querySelector('#mk-download-brief').href", "  window.mewepakClient.fillBrief('mk', data, brief);\n  root.querySelector('#mk-download-brief').href")


def import_page(page, source, output):
    raw = DATA.sub(external_image, source.read_text(encoding="utf-8-sig"))
    if page == "packaging":
        raw = raw.replace("Check the details before opening your email draft.", "Check the details before sending your request.")
        raw = raw.replace("Have artwork or reference photos? Attach them in your email app before sending.", "Have artwork or reference photos? Mention them in the project notes so our team can follow up.")
        raw = raw.replace("Review your details, then open your email draft to send your enquiry.", "Review your details, then send your enquiry directly to Mewepak.")
        raw = raw.replace("Use the form to prepare and review your brief, then open the email draft. Attach your artwork, photographs or reference documents in your email app before sending.", "Mention any artwork, photographs or reference documents in the project notes. Our team will follow up to collect the files.")
        raw = raw.replace("Company <small>Optional</small>", "Company <em>*</em>")
    if page == "quote":
        raw = raw.replace("Company or brand <small>Optional</small>", 'Company or brand <b aria-hidden="true">*</b>')
        raw = raw.replace("Yes. Attach artwork, a dieline or a photo of the existing pack when you open the email draft.", "Yes. Mention any artwork, dielines or reference photos in your request, and our team will follow up to collect them.")
    if page in SECOND_PHASE_BRIEFS:
        for before, after in DRAFT_COPY.items():
            raw = raw.replace(before, after)
    doc = html.document_fromstring(raw)
    head = exactly(doc, "//head")
    for meta in head.xpath('./meta[@name="referrer"]'):
        meta.drop_tree()
    body = exactly(doc, "//body")
    main = exactly(doc, "//main")
    main.set("data-client-page", page)
    current = html.parse(str(output)).getroot()
    for tag in current.xpath('//head/meta[@name="description" or @name="robots"]|//head/link[@rel="canonical"]'):
        if tag.tag == "link":
            continue
        if not head.xpath(f'./meta[@name="{tag.get("name")}"]'):
            head.append(tag)
    canonical = PAGES[page]
    if not head.xpath('./link[@rel="canonical"]'):
        append(head, f'<link rel="canonical" href="{canonical}">')
    if page == "home" and not head.xpath('./meta[@name="description"]'):
        append(head, '<meta name="description" content="Explore Mewepak custom flexible packaging, pouch formats, printed film, and packaging for your market.">')
    for el in doc.xpath('//*[@href]'):
        el.set("href", local_link(el.get("href"), page))
    for el in doc.xpath('//*[@src]'):
        if "__" in el.get("src", "") and el.get("src", "").startswith("data:"):
            raise ValueError("Unresolved source asset")
    for nav in doc.xpath('//nav[contains(@class,"mw-nav") or contains(@class,"mw-mobile-links")]'):
        for link in nav.xpath('.//a'):
            label = " ".join(link.text_content().replace("↗", "").split())
            if label == "Contact":
                link.set("href", "/contact/")
            elif label == "Get a Quote":
                link.set("href", "/inquiry/#quote-request")
            elif label == "Our Process":
                link.set("href", "/solutions/")
            elif label == "Insights":
                link.set("href", "/blog/")
    for img in doc.xpath('//img'):
        if img.get("fetchpriority") != "high" and img.get("class") not in {"mw-logo", "mw-footer-logo", "pk-sky-products"} and not img.get("data-hero-shot"):
            img.set("loading", "lazy")
        img.set("decoding", "async")
    script = exactly(doc, "//script")
    js = script.text or ""
    script.getparent().remove(script)
    for el in doc.xpath('//*[@class and contains(concat(" ", normalize-space(@class), " "), " mw-quote ")]'):
        if el.tag == "a":
            el.set("href", "/inquiry/#quote-request")
    if page == "quote":
        review_submission(doc, "qt", "qt-button")
        newsletter(doc, "qt-updates-form")
        exactly(doc, '//*[@id="qt-updates-note"]').text = "Get packaging ideas and updates by email."
        exactly(doc, '//*[@id="qt-updates-draft"]').drop_tree()
        js = js[:js.index("  const updatesForm")] + "  showStep(0, false);\n})();\n"
        js = re.sub(r"^.*(?:const draft = |draft\.removeAttribute|draft\.href =).*\n", "", js, flags=re.M)
        js = js.replace("    form.hidden = true;", "    window.mewepakClient.fillBrief('qt', formData, brief);\n    form.hidden = true;")
        form = exactly(doc, '//*[@id="qt-form"]')
        form.set("novalidate", "")
        exactly(form, './/input[@name="company"]').set("required", "")
        tip = exactly(form, './/p[@class="qt-form-tip"]')
        tip.text = "Review your brief before sending it directly to Mewepak."
        studio = exactly(doc, '//*[@id="artwork-preview"]')
        append(studio, '<p class="mw-inner"><a class="qt-button" href="/3d-preview/">Open interactive 3D preview ↗</a></p>')
    elif page == "packaging":
        review_submission(doc, "pk", "pk-btn")
        js = re.sub(r"^.*pk-open-email.*\n", "", js, flags=re.M)
        js = js.replace(" const formats=", " let formats=", 1).replace("(function(){", "(async function(){", 1)
        marker = " const cards=formats.map"
        if marker not in js:
            raise ValueError("Packaging card initialization not found")
        js = js.replace(marker, " formats = await window.mewepakClient.catalogue(formats);\n" + marker)
        js = js.replace("  root.querySelector('#pk-review-format').textContent=formatName;", "  window.mewepakClient.fillBrief('pk', new FormData(form), brief, formatName);\n  root.querySelector('#pk-review-format').textContent=formatName;")
        js = js.replace("  selectedFormat=formats.find(format=>format.id===trigger.dataset.detail);if(!selectedFormat)return;", "  selectedFormat=formats.find(format=>format.id===trigger.dataset.detail);if(!selectedFormat)return;\n  root.querySelector('#pk-open-detail').href = '/products/' + encodeURIComponent(selectedFormat.slug) + '/';")
        js = js.replace("image.dataset.asset=format.image;", "if (format.image) image.dataset.asset=format.image; else image.src=window.mewepakClient.formatImage(format, assets); image.loading='lazy';")
        js = js.replace("image.src=assets[selectedFormat.image];", "image.src=window.mewepakClient.formatImage(selectedFormat, assets);")
        js = js.replace("  const tags=element('ul','pk-card-tags');", "  const formatIcon = window.mewepakClient.formatIcon(format.slug);\n  if (formatIcon) copy.querySelector('h3').prepend(formatIcon);\n  const tags=element('ul','pk-card-tags');")
        action = exactly(doc, '//*[@id="pk-use-format"]')
        action.addnext(html.fragment_fromstring('<a class="pk-text-link" id="pk-open-detail" href="/products/">View full product details ↗</a>'))
        exactly(doc, '//*[@id="pk-enquiry-form"]//input[@name="company"]').set("required", "")
        js = js.replace("Please attach any artwork or reference files before sending.", "Artwork can be shared with the Mewepak team during follow-up.")
    elif page == "home":
        newsletter(doc, "hy-subscribe-form")
        js = re.sub(r"^const subscribe=.*\n", "", js, flags=re.M)
        for anchor in doc.xpath('//main//a[@href="#mw-contact"]'):
            if "quote" in anchor.text_content().lower():
                anchor.set("href", "/inquiry/#quote-request")
        append(exactly(doc, '//*[@id="mw-products"]'), '<div class="mw-inner client-crosslinks"><a href="/products/">Explore all packaging formats ↗</a><a href="/3d-preview/">Try the interactive 3D preview ↗</a></div>')
        js += "\nwindow.mewepakClient.home();\n"
    elif page in SECOND_PHASE_BRIEFS:
        js = connect_additional_brief(doc, page, js)
    elif page == "insights":
        featured_links = sorted(set(doc.xpath('//main//a[(contains(@class, "in-read") or contains(@class, "in-feature-media")) and starts-with(@href, "/")]/@href')))
        exactly(doc, '//*[@id="in-grid"]').set("data-featured-articles", " ".join(featured_links))
        newsletter(doc, "in-update-form")
        exactly(doc, '//*[@class="in-form-note"]').text = "Receive packaging insights and updates by email."
        exactly(doc, '//*[@id="in-email-result"]').drop_tree()
        js = js[:js.index("  const updates")] + "})();\n"
    if page == "home":
        js = re.sub(r"^.*root\.querySelector\('#mw-search-form'\).*\n", "", js, flags=re.M)
    elif page == "packaging":
        js = re.sub(r"^ root\.querySelector\('#mw-search-form'\)\.addEventListener[^\n]+\n[^\n]+\n \}\);\n", "", js, flags=re.M)
    # Remove preview-only parent-window messages and eager loading.
    js = re.sub(r"if\(parent!==window\)parent\.postMessage\([^;]+;", "", js)
    js = js.replace("img.loading='eager';", "").replace("image.loading='eager';", "")
    for el in doc.xpath('//*[@data-asset and self::img]'):
        key = el.get("data-asset")
        match = re.search(r'"' + re.escape(key) + r'":"(' + re.escape(PREFIX) + r'images/[^"]+)"', js)
        if match:
            el.set("src", match.group(1))
    css = []
    for style in doc.xpath("//style"):
        css.append(style.text or "")
        style.getparent().remove(style)
    (DESIGN / f"{page}.css").write_text("\n".join(css), encoding="utf-8")
    (DESIGN / f"{page}.js").write_text(js, encoding="utf-8")
    for path in (page + ".css", "integration.css"):
        append(head, f'<link rel="stylesheet" href="{PREFIX}{path}">')
    for path in ("integration.js", page + ".js"):
        append(body, f'<script src="{PREFIX}{path}" defer></script>')
    output.write_text(html.tostring(apply_site_shell(doc), encoding="unicode", doctype="<!doctype html>"), encoding="utf-8")


if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    for page in PAGES:
        cli.add_argument(f"--{page}", type=Path)
    args = cli.parse_args()
    if not any(vars(args).values()):
        cli.error("Pass at least one page export.")
    IMAGES.mkdir(parents=True, exist_ok=True)
    for page, route in PAGES.items():
        if source := getattr(args, page):
            import_page(page, source, ROOT / route.strip("/") / "index.html")
