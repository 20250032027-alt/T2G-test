/* ============================================================
   T2G product reviews
   Reviews are stored in Supabase and appear on the site only after
   they are approved in admin.html. Used by the product page and the
   quick-view window (cart.js).
   ============================================================ */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dbOn = () => Boolean(window.T2G_DB && T2G_DB.enabled());
  const fmtDate = d => new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

  function starsHtml(rating, size) {
    const r = Math.round(Number(rating) * 2) / 2;
    let out = '';
    for (let i = 1; i <= 5; i++) {
      const fill = r >= i ? 100 : r >= i - 0.5 ? 50 : 0;
      out += `<span class="rv-star" style="--fill:${fill}%;${size ? 'font-size:' + size : ''}" aria-hidden="true">&#9733;</span>`;
    }
    return `<span class="rv-stars" role="img" aria-label="${r} out of 5 stars">${out}</span>`;
  }

  /* Average rating + count for all products, fetched once per page */
  let summaryPromise = null;
  function summary() {
    if (!dbOn()) return Promise.resolve({});
    if (!summaryPromise) summaryPromise = T2G_DB.rpc('review_summary', {}).catch(() => ({}));
    return summaryPromise;
  }

  const cache = {};
  function list(productId) {
    if (!dbOn()) return Promise.resolve([]);
    if (!cache[productId]) cache[productId] = T2G_DB.rpc('get_reviews', { p_product_id: productId }).catch(() => { delete cache[productId]; return null; });
    return cache[productId];
  }

  /* Render the full reviews block (summary, list, form) into `root`.
     opts.onCount(n) is called with the number of approved reviews. */
  function mount(root, product, opts) {
    opts = opts || {};
    if (!root || !product) return;
    const saved = (() => { try { return JSON.parse(localStorage.getItem('t2g_reviewer') || '{}'); } catch (e) { return {}; } })();

    root.innerHTML = `
      <div class="rv-summary" data-rv-summary></div>
      <div class="rv-list" data-rv-list><p class="rv-empty">Loading reviews…</p></div>
      ${dbOn() ? `
      <form class="rv-form" novalidate>
        <h3 class="rv-form-title">Write a review</h3>
        <p class="rv-form-note">Reviews are checked by T2G before they appear, usually within a day or two. Your email is never shown.</p>
        <fieldset class="rv-rating">
          <legend>Your rating <span aria-hidden="true">*</span></legend>
          <div class="rv-rating-stars">
            ${[5, 4, 3, 2, 1].map(n => `<input type="radio" name="rv-rating" id="rv-${esc(product.id)}-${n}" value="${n}"><label for="rv-${esc(product.id)}-${n}" title="${n} star${n > 1 ? 's' : ''}">&#9733;</label>`).join('')}
          </div>
        </fieldset>
        <label class="rv-field">
          <span>Your review <span aria-hidden="true">*</span></span>
          <textarea name="body" rows="4" maxlength="2000" placeholder="How did you use it? What did you like or not like?"></textarea>
        </label>
        <div class="rv-two">
          <label class="rv-field"><span>Name <span aria-hidden="true">*</span></span><input name="name" type="text" maxlength="60" autocomplete="given-name" value="${esc(saved.name || '')}"></label>
          <label class="rv-field"><span>Email <span aria-hidden="true">*</span></span><input name="email" type="email" maxlength="160" autocomplete="email" value="${esc(saved.email || '')}"></label>
        </div>
        <label class="rv-save"><input type="checkbox" name="save" ${saved.name ? 'checked' : ''}> Remember my name and email on this device</label>
        <button type="submit" class="btn btn-green rv-submit">Submit review</button>
        <p class="rv-msg" role="status" aria-live="polite"></p>
      </form>` : `<p class="rv-form-note">Reviews will open soon.</p>`}
    `;

    const listEl = root.querySelector('[data-rv-list]');
    const sumEl  = root.querySelector('[data-rv-summary]');

    list(product.id).then(reviews => {
      if (reviews === null) { listEl.innerHTML = '<p class="rv-empty">Reviews could not be loaded right now.</p>'; return; }
      if (opts.onCount) opts.onCount(reviews.length);
      if (!reviews.length) {
        listEl.innerHTML = `<p class="rv-empty">No reviews yet. Tried ${esc(product.name)}? Be the first to share what you think.</p>`;
        sumEl.innerHTML = '';
        return;
      }
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      sumEl.innerHTML = `${starsHtml(avg, '1.1rem')} <strong>${avg.toFixed(1)}</strong> <span>out of 5 · ${reviews.length} review${reviews.length > 1 ? 's' : ''}</span>`;
      listEl.innerHTML = reviews.map(r => `
        <article class="rv-item">
          <header>
            <strong>${esc(r.name)}</strong>
            ${r.verified ? '<span class="rv-verified">Verified buyer</span>' : ''}
            <time datetime="${esc(r.created_at)}">${fmtDate(r.created_at)}</time>
          </header>
          ${starsHtml(r.rating)}
          <p>${esc(r.body).replace(/\n/g, '<br>')}</p>
          ${r.reply ? `<div class="rv-reply"><strong>Reply from T2G</strong><p>${esc(r.reply).replace(/\n/g, '<br>')}</p></div>` : ''}
        </article>`).join('');
    });

    const form = root.querySelector('.rv-form');
    if (!form) return;
    const msg = form.querySelector('.rv-msg');
    const say = (text, ok) => { msg.textContent = text; msg.className = 'rv-msg ' + (ok ? 'ok' : 'err'); };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const rating = Number((form.querySelector('input[name="rv-rating"]:checked') || {}).value || 0);
      const body   = form.elements.body.value.trim();
      const name   = form.elements.name.value.trim();
      const email  = form.elements.email.value.trim();
      if (!rating) return say('Please choose a star rating.');
      if (body.length < 3) return say('Please write a few words about the product.');
      if (!name) return say('Please enter your name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return say('Please enter a valid email address.');

      const btn = form.querySelector('.rv-submit');
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        await T2G_DB.rpc('submit_review', { p_product_id: product.id, p_name: name, p_email: email, p_rating: rating, p_body: body });
        try {
          if (form.elements.save.checked) localStorage.setItem('t2g_reviewer', JSON.stringify({ name, email }));
          else localStorage.removeItem('t2g_reviewer');
        } catch (err) {}
        form.reset();
        if (form.elements.save && name) { form.elements.name.value = name; form.elements.email.value = email; form.elements.save.checked = true; }
        say('Thank you. Your review has been sent and will appear once T2G has checked it.', true);
        btn.textContent = 'Submit review';
      } catch (err) {
        say(err && err.userFacing ? err.message : 'Your review could not be sent. Please try again in a moment.');
        btn.textContent = 'Submit review';
      } finally {
        btn.disabled = false;
      }
    });
  }

  window.T2G_REVIEWS = { mount, summary, starsHtml };
})();
