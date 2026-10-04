import { esc, text, attr, plain, hasContent } from "../lib/html.mjs";
import { icon } from "../lib/icons.mjs";
import { socialLinks } from "../layout.mjs";

const slug = (s) => plain(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function field({ id, label, type = "text", required = true, hint = "", autocomplete = "", inputmode = "" }) {
  const describedby = [hint ? `${id}-hint` : "", `${id}-error`].filter(Boolean).join(" ");
  const input = type === "textarea"
    ? `<textarea id="${id}" name="${id}"${required ? " required" : ""} aria-describedby="${describedby}"></textarea>`
    : `<input id="${id}" name="${id}" type="${type}"${required ? " required" : ""}${autocomplete ? ` autocomplete="${autocomplete}"` : ""}${inputmode ? ` inputmode="${inputmode}"` : ""} aria-describedby="${describedby}">`;
  return `<div class="field">
            <label for="${id}">${label}${required ? "" : ' <span class="optional">(optional)</span>'}</label>
            ${input}
            ${hint ? `<p class="hint" id="${id}-hint">${hint}</p>` : ""}
            <p class="error" id="${id}-error"></p>
          </div>`;
}

function choices({ name, legend, options, type, required = true }) {
  return `<fieldset class="field choices" data-group="${name}"${required ? " data-required" : ""} aria-describedby="${name}-error">
            <legend>${legend}${type === "checkbox" ? ' <span class="optional">(choose any)</span>' : ""}</legend>
            <div class="choice-list">
              ${options.map((o) => `<label class="choice"><input type="${type}" name="${name}" value="${attr(o)}"${required && type === "radio" ? " required" : ""}><span>${text(o)}</span></label>`).join("\n              ")}
            </div>
            <p class="error" id="${name}-error"></p>
          </fieldset>`;
}

export function renderContact({ site, contact }) {
  const endpoint = plain(site.form.endpoint);
  const netlify = endpoint === "netlify";
  const f = contact.form;
  const socials = socialLinks(site);
  // Without JavaScript the form still posts: to the endpoint if set, otherwise via the visitor's mail app.
  const action = netlify ? "/contact?sent=1" : endpoint || `mailto:${plain(site.email)}?subject=Project%20brief`;
  const formAttrs = [
    `action="${esc(action)}"`,
    'method="post"',
    !endpoint ? 'enctype="text/plain"' : "",
    netlify ? 'name="brief" data-netlify="true" netlify-honeypot="_gotcha"' : "",
    `data-endpoint="${esc(endpoint)}"`,
    `data-email="${attr(site.email)}"`,
    `data-success="${attr(f.success)}"`,
    "novalidate",
    "data-brief-form",
  ].filter(Boolean).join(" ");

  return `
    <div class="wrap">
      <header class="page-head">
        <h1>${text(contact.heading)}</h1>
        <p>${text(contact.intro)}</p>
      </header>

      <div class="contact-grid">
        <form class="form" ${formAttrs}>
          ${netlify ? '<input type="hidden" name="form-name" value="brief">' : ""}
          <div class="honeypot" aria-hidden="true">
            <label for="_gotcha">Leave this field empty</label>
            <input id="_gotcha" name="_gotcha" type="text" tabindex="-1" autocomplete="off">
          </div>
          <div class="form-row">
            ${field({ id: "name", label: "Your name", autocomplete: "name" })}
            ${field({ id: "company", label: "Company", autocomplete: "organization" })}
          </div>
          ${field({ id: "email", label: "Email", type: "email", autocomplete: "email" })}
          ${field({ id: "product", label: "Product", hint: "What are we animating? For example: a wireless headset, a serum bottle, a running shoe." })}
          ${choices({ name: "need", legend: "What you need", options: f.needOptions, type: "radio" })}
          ${choices({ name: "channels", legend: "Where it will run", options: f.channelOptions, type: "checkbox" })}
          <div class="form-row">
            ${field({ id: "deadline", label: "Deadline", required: false, hint: "A date, or something like “end of May”." })}
            <div class="field">
              <label for="budget">Budget range <span class="optional">(optional)</span></label>
              <select id="budget" name="budget">
                <option value="">Choose a range</option>
                ${f.budgetOptions.map((o) => `<option>${text(o)}</option>`).join("")}
              </select>
            </div>
          </div>
          ${field({ id: "message", label: "Message", type: "textarea", hint: "The goal, the audience, anything you already have (CAD files, photos, a storyboard)." })}
          ${field({ id: "references", label: "Link to references", type: "url", required: false, inputmode: "url", hint: "A moodboard, a folder or examples you like. Starts with https://" })}

          <div class="form-status" role="status" aria-live="polite" tabindex="-1" data-status hidden></div>
          <div class="form-actions">
            <button class="btn btn-action" type="submit">${text(f.submit)}</button>
          </div>
          <p class="privacy">${text(f.privacy)}</p>
        </form>

        <aside class="contact-aside" aria-label="Other ways to reach us">
          <div>
            <h2>Email</h2>
            <a class="contact-email" href="mailto:${attr(site.email)}">${text(site.email)}</a>
            ${socials.length ? `<ul class="link-list" role="list">${socials.map((s) => `<li><a href="${esc(s.href)}" rel="noopener" target="_blank">${s.label}</a></li>`).join("")}</ul>` : ""}
          </div>
          <div>
            <h2>${text(contact.next.heading)}</h2>
            <p class="muted">${text(contact.next.text)}</p>
          </div>
        </aside>
      </div>

      <section class="faq" aria-labelledby="faq-title" style="padding-bottom: var(--section)">
        <h2 class="h2" id="faq-title" style="margin-bottom: var(--s-6)">${text(contact.faq.heading)}</h2>
        ${contact.faq.items.map((item) => `<details>
          <summary>${text(item.q)}${icon("plus")}</summary>
          <p>${text(item.a)}</p>
        </details>`).join("\n        ")}
      </section>
    </div>`;
}

export function renderNotFound() {
  return `
    <div class="wrap not-found">
      <h1>Page not found</h1>
      <p>That page doesn't exist or has moved.</p>
      <div class="actions">
        <a class="btn btn-action" href="/work">See our work</a>
        <a class="btn btn-quiet" href="/">Go to the homepage</a>
      </div>
    </div>`;
}

export { slug };
