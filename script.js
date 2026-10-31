/*
 * static-site/script.js — ванильный JS без зависимостей.
 * Повторяет поведение клиентских компонентов приложения
 * (Header, MobileBar, LeadModal, FAQ, Reviews) на готовой SSR-разметке.
 * Значения (пороги, тайминги, классы) скопированы из исходников компонентов.
 */
(function () {
  "use strict";

  /* ── Отправка формы ─────────────────────────────────────────────────
   * ЗАРЕЗЕРВИРОВАННАЯ ПУСТАЯ ФУНКЦИЯ. Контракт: вызывается с FormData
   * валидной формы; верните true после успешной отправки — только тогда
   * посетителю показывается экран успеха. До подключения отправки
   * функция возвращает undefined и сабмит не даёт отклика — это ожидаемо. */
  function submitLead(formData) { /* Подключается при деплое: сюда приходит FormData формы. Верните true после успешной отправки. */ }
  window.submitLead = submitLead;

  var REDUCE_QUERY = window.matchMedia("(prefers-reduced-motion: reduce)");
  var REDUCE = REDUCE_QUERY.matches;
  // живая подписка: включение reduce на открытой странице мигрирует
  // скролл-анимации в финальные состояния (модули регистрируют обработчики)
  var reduceHandlers = [];
  function onReduceChange() {
    REDUCE = REDUCE_QUERY.matches;
    reduceHandlers.forEach(function (fn) { fn(); });
  }
  if (REDUCE_QUERY.addEventListener) {
    REDUCE_QUERY.addEventListener("change", onReduceChange);
  } else if (REDUCE_QUERY.addListener) {
    REDUCE_QUERY.addListener(onReduceChange); // старый Safari
  }

  var PHONE = { display: "+7 (495) 609-28-64", href: "tel:+74956092864" };

  // Иконки Phosphor (bold), которых нет в SSR-разметке: крестик и телефон
  // для JS-панелей (мобильное меню, модалка, MobileBar). Контур и «плюс»
  // уже отрендерены в HTML.
  var ICON_X =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path></svg>';
  var ICON_PHONE =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M224,154.8l-47.09-21.11-.18-.08a19.94,19.94,0,0,0-19,1.75,13.08,13.08,0,0,0-1.12.84l-22.31,19c-13-7.05-26.43-20.37-33.49-33.21l19.06-22.66a11.76,11.76,0,0,0,.85-1.15,20,20,0,0,0,1.66-18.83,1.42,1.42,0,0,1-.08-.18L101.2,32A20.06,20.06,0,0,0,80.42,20.15,60.27,60.27,0,0,0,28,80c0,81.61,66.39,148,148,148a60.27,60.27,0,0,0,59.85-52.42A20.06,20.06,0,0,0,224,154.8ZM176,204A124.15,124.15,0,0,1,52,80,36.29,36.29,0,0,1,80.48,44.46l18.82,42L80.14,109.28a12,12,0,0,0-.86,1.16A20,20,0,0,0,78,130.08c9.42,19.28,28.83,38.56,48.31,48A20,20,0,0,0,146,176.63a11.63,11.63,0,0,0,1.11-.85l22.43-19.07,42,18.81A36.29,36.29,0,0,1,176,204Z"></path></svg>';

  // Пункты меню (Header.tsx, NAV)
  var NAV = [
    { href: "#uslugi", label: "Услуги" },
    { href: "#process", label: "Этапы" },
    { href: "#nedvizhimost", label: "Недвижимость" },
    { href: "#komanda", label: "Команда" },
    { href: "#otzyvy", label: "Отзывы" },
    { href: "#kontakty", label: "Контакты" },
  ];

  // Вопросы-ответы (lib/faq.ts): SSR рендерит только свёрнутые вопросы
  var FAQ_ITEMS = [
    { q: "Сколько стоят услуги агентства?", a: "Зависит от задачи и объёма работы. Точную сумму мы называем после первой консультации и фиксируем в договоре до начала работы — по ходу сделки она не меняется." },
    { q: "Как определяется стоимость недвижимости?", a: "Мы учитываем похожие предложения, состояние объекта, расположение, документы и текущий спрос. В результате предлагаем ценовой диапазон и стратегию выхода на рынок." },
    { q: "За какой срок можно продать объект?", a: "Единого честного срока для всех объектов не существует: он зависит от цены, ликвидности, готовности документов и спроса. После анализа мы предложим реалистичный сценарий и контрольные точки." },
    { q: "Можно ли продать квартиру, которая находится в ипотеке?", a: "Во многих случаях да. Сначала уточняем остаток задолженности, требования банка и подходящую схему расчётов. Окончательный сценарий определяется после изучения документов." },
    { q: "Вы проводите альтернативные сделки и обмен?", a: "Да. Мы связываем продажу одного объекта и покупку другого в единую последовательность, синхронизируем участников, документы и расчёты." },
    { q: "Можно заказать только юридическое сопровождение?", a: "Да. Агентство оказывает отдельную услугу юридического сопровождения сделки без обязательного поиска или продажи объекта." },
    { q: "В каких регионах вы работаете?", a: "Основной регион: Москва и Московская область. Возможность работы с объектом в другом регионе обсуждается отдельно." },
    { q: "Какие документы нужны для первой консультации?", a: "На первом этапе документы не нужны. Достаточно описать объект, форму собственности и вашу задачу. После разговора специалист даст конкретный список." },
  ];

  // Карточка услуг → задача заявки (Tasks.tsx: openLead(card.task))
  var TASK_BY_TITLE = {
    "Продать недвижимость": "Продать",
    "Купить недвижимость": "Купить",
    "Новостройки": "Новостройка",
    "Обменять или разъехаться": "Обменять",
    "Ипотека и рефинансирование": "Ипотека",
    "Нестандартная задача": "Другое",
  };

  // Полные классы чипа радиогруппы «Что требуется?» (TaskRadiogroup.tsx)
  var CHIP_BASE = "h-9 rounded-full border px-3.5 text-sm font-medium transition-colors ";
  var CHIP_ON = CHIP_BASE + "border-wine bg-wine text-white";
  var CHIP_OFF = CHIP_BASE + "border-line bg-surface text-ink hover:border-ink/30";

  /* ── Утилиты ─────────────────────────────────────────────────────── */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // components/focusTrap.ts: удерживает Tab внутри контейнера
  function trapTabKey(e, container) {
    var focusables = $all(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      container
    ).filter(function (el) {
      return (
        !el.hasAttribute("disabled") &&
        el.tabIndex !== -1 &&
        // скрытые элементы (например, поле комментария при hidden) не подрядны
        el.offsetParent !== null
      );
    });
    if (focusables.length === 0) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    var active = document.activeElement;
    var inside = container.contains(active);
    if (e.shiftKey && (active === first || !inside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !inside)) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ── Шапка (Header.tsx) ──────────────────────────────────────────── */

  function initHeader() {
    var header = $("header");
    var sentinel = $("#top-sentinel");
    if (!header || !sentinel) return;
    var obs = new IntersectionObserver(function (entries) {
      header.classList.toggle("hdr-scrolled", !entries[0].isIntersecting);
    }, { rootMargin: "24px 0px 0px 0px" });
    obs.observe(sentinel);
  }

  /* ── Радиогруппа «Что требуется?» (TaskRadiogroup.tsx) ───────────── */

  function wireRadiogroup(group, initial, onChange) {
    var chips = $all('[role="radio"]', group);
    var value = initial;
    function render() {
      chips.forEach(function (chip) {
        var on = chip.textContent.trim() === value;
        chip.setAttribute("aria-checked", on ? "true" : "false");
        chip.tabIndex = on ? 0 : -1;
        chip.className = on ? CHIP_ON : CHIP_OFF;
      });
    }
    function selectAt(i) {
      value = chips[i].textContent.trim();
      render();
      chips[i].focus();
      onChange(value);
    }
    chips.forEach(function (chip, i) {
      chip.addEventListener("click", function () {
        value = chip.textContent.trim();
        render();
        onChange(value);
      });
    });
    group.addEventListener("keydown", function (e) {
      var from = chips.findIndex(function (c) { return c.textContent.trim() === value; });
      var last = chips.length - 1;
      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          selectAt(from === last ? 0 : from + 1);
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          selectAt(from === 0 ? last : from - 1);
          break;
        case "Home":
          e.preventDefault();
          selectAt(0);
          break;
        case "End":
          e.preventDefault();
          selectAt(last);
          break;
      }
    });
    render();
  }

  /* ── Формы: валидация → window.submitLead(FormData) ────────────────
   * Правила и тексты ошибок — из приложения (lead/useLeadSubmit.ts):
   * только валидная форма доходит до submitLead. Экран успеха
   * показывается ТОЛЬКО если submitLead вернул true; любой другой
   * исход (заглушка возвращает undefined, сетевая ошибка, reject) —
   * сообщение об ошибке с телефоном (контракт в README-hosting.md). */

  function validateLead(data) {
    var name = String(data.get("name") || "").trim();
    if (name.length < 2) return "Укажите имя";
    var digits = String(data.get("phone") || "").replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15)
      return "Укажите корректный номер телефона";
    if (!data.get("consent"))
      return "Подтвердите согласие на обработку персональных данных";
    return null;
  }

  function clearFormError(form) {
    var old = $('[role="alert"]', form);
    if (old) old.parentNode.removeChild(old);
  }

  // Ошибка — над согласием и кнопкой сабмита, как motion.p в LeadForm.tsx:
  // text-sm font-medium text-[#b3261e], role="alert", появление
  // opacity 0→1 / y −4→0 за 0.18s easeOut
  function showFormError(form, message) {
    clearFormError(form);
    var p = document.createElement("p");
    p.setAttribute("role", "alert");
    p.className = "text-sm font-medium text-[#b3261e]";
    p.textContent = message;
    var consent = $('input[type="checkbox"]', form);
    var anchor =
      (consent && consent.closest("label")) ||
      $('button[type="submit"]', form);
    if (anchor) form.insertBefore(p, anchor);
    else form.appendChild(p);
    if (!REDUCE && p.animate) {
      p.animate(
        [
          { opacity: 0, transform: "translateY(-4px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 180, easing: "ease-out" }
      );
    }
  }

  // Любой не-true исход отправки (false/undefined/reject/исключение):
  // посетитель должен узнать о сбое — сообщение с телефоном в том же
  // стиле, что и валидационные ошибки; исчезает при следующем сабмите
  // (clearFormError) или после успеха (форму заменяет экран успеха)
  var SEND_ERROR_MESSAGE =
    "Не удалось отправить заявку. Позвоните нам: " + PHONE.display;

  function handleForm(form, onSuccess) {
    // пока асинхронный submitLead не разрешился, повторный сабмит
    // игнорируется (без индикатора — дизайн не меняется)
    var pending = false;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (pending) return;
      clearFormError(form);
      var problem = validateLead(new FormData(form));
      if (problem) {
        showFormError(form, problem);
        return;
      }
      var data = new FormData(form);
      var result;
      try {
        result = window.submitLead(data);
      } catch (err) {
        result = undefined; // синхронный сбой отправки
      }
      // контракт: true синхронно → экран успеха; Promise (thenable) →
      // дождаться разрешения: true после успешного ответа сервера →
      // success, любой другой исход → сообщение об ошибке;
      // undefined/false → тоже сообщение об ошибке
      if (result === true) {
        if (onSuccess) onSuccess();
        return;
      }
      if (result && typeof result.then === "function") {
        pending = true;
        result.then(
          function (ok) {
            pending = false;
            if (ok === true && onSuccess) onSuccess();
            else showFormError(form, SEND_ERROR_MESSAGE);
          },
          function () {
            pending = false; // отклонение/сетевая ошибка
            showFormError(form, SEND_ERROR_MESSAGE);
          }
        );
        return;
      }
      showFormError(form, SEND_ERROR_MESSAGE);
    });
  }

  /* ── Экран успеха заявки (lead/LeadSuccess.tsx) ────────────────────
   * Общий для инлайн-формы и модалки: role="status" для анонса
   * скринридером, фокус на заголовок (restart таб-порядка), у модалки —
   * кнопка «Готово». window.submitLead остаётся пустой заглушкой. */
  var ICON_CHECK_CIRCLE =
    '<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" fill="currentColor" viewBox="0 0 256 256" class="mx-auto text-wine" aria-hidden="true"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path></svg>';

  function buildSuccess(variant, onDone) {
    var isSection = variant === "section";
    var div = document.createElement("div");
    div.setAttribute("role", "status");
    div.className =
      "st-success " + (isSection ? "py-10 text-center" : "py-6 text-center");
    div.innerHTML =
      ICON_CHECK_CIRCLE.replace(/\{SIZE\}/g, isSection ? "64" : "56") +
      '<h3 tabindex="-1" class="' + (isSection ? "mt-5 text-2xl font-bold" : "mt-4 text-xl font-bold") +
      ' focus:outline-none">Спасибо, заявка отправлена</h3>' +
      '<p class="' + (isSection
        ? "mx-auto mt-2 max-w-[36ch] leading-relaxed text-ink-soft"
        : "mt-2 text-sm leading-relaxed text-ink-soft") + '">' +
      "Мы получили ваши контактные данные. Специалист свяжется с вами по указанному номеру.</p>" +
      (onDone
        ? '<button type="button" class="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-wine px-6 font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.98]">Готово</button>'
        : "");
    if (onDone) {
      $("button", div).addEventListener("click", onDone);
    }
    // фокус на заголовок выставляет ВЫЗЫВАЮЩИЙ после вставки div в DOM:
    // focus() на отвязанном элементе теряется (useEffect в LeadSuccess
    // срабатывает по факту монтирования ветки)
    return div;
  }

  // Инлайн-форма секции #zayavka (LeadForm.tsx): у полей SSR-разметки нет
  // name — добавляем, чтобы FormData был осмысленным
  function initSectionForm() {
    var form = $("#zayavka form");
    if (!form) return;
    var names = {
      "lf-name": "name",
      "lf-phone": "phone",
      "lf-object": "object",
      "lf-comment": "comment",
      "lf-consent": "consent",
    };
    Object.keys(names).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute("name", names[id]);
    });
    var hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = "task";
    hidden.value = "Продать";
    form.appendChild(hidden);
    var group = $('[role="radiogroup"]', form);
    if (group) {
      wireRadiogroup(group, "Продать", function (task) { hidden.value = task; });
    }
    handleForm(form, function () {
      // success вместо формы внутри той же карточки (LeadForm.tsx:
      // AnimatePresence mode="wait" меняет ветки)
      var success = buildSuccess("section");
      form.replaceWith(success);
      // фокус на заголовок success — только когда lead-модалка не открыта:
      // success под открытой модалкой не должен красть фокус из её полей
      // (modalOverlay — авторитетный признак открытой модалки)
      if (!modalOverlay) $("h3", success).focus();
    });
  }

  /* ── Мобильное меню (Header.tsx) ─────────────────────────────────── */

  var burger = null;
  var menuOverlay = null;

  function buildMenu() {
    var logo = $("header a[aria-label^='Позитив ВТ'] > span");
    var overlay = document.createElement("div");
    overlay.className = "st-overlay fixed inset-0 z-50 lg:hidden";
    overlay.setAttribute("data-menu-overlay", "");
    overlay.innerHTML =
      '<button type="button" aria-label="Закрыть меню" tabindex="-1" class="absolute inset-0 bg-ink/45" data-menu-backdrop></button>' +
      '<div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Меню" class="st-panel-menu absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto overscroll-contain rounded-b-2xl bg-surface p-6 pb-8 shadow-2xl shadow-ink/20">' +
      '  <div class="flex items-center justify-between">' +
      '    <span class="text-wine">' + (logo ? logo.outerHTML : "") + "</span>" +
      '    <button type="button" aria-label="Закрыть меню" class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink" data-menu-close>' + ICON_X + "</button>" +
      "  </div>" +
      '  <nav class="mt-6 flex flex-col divide-y divide-line">' +
      NAV.map(function (item) {
        return '<a href="' + item.href + '" class="py-3.5 text-lg font-semibold">' + item.label + "</a>";
      }).join("") +
      "  </nav>" +
      '  <div class="mt-6 flex flex-col gap-3">' +
      '    <button type="button" class="h-12 rounded-full bg-wine font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.98]" data-menu-cta>Получить консультацию</button>' +
      '    <a href="' + PHONE.href + '" class="tnum flex h-12 items-center justify-center gap-2 rounded-full border border-line text-[15px] font-semibold transition-colors active:bg-paper">' +
      '      <span class="text-wine">' + ICON_PHONE + "</span>" + PHONE.display + "</a>" +
      "  </div>" +
      "</div>";
    document.body.appendChild(overlay);

    $all("nav a", overlay).forEach(function (a) {
      // как в приложении: закрытие уходит на макротаск, чтобы фрагментная
      // навигация не затёрла возврат фокуса на бургер
      a.addEventListener("click", function () { setTimeout(closeMenu, 0); });
    });
    $("[data-menu-backdrop]", overlay).addEventListener("click", closeMenu);
    $("[data-menu-close]", overlay).addEventListener("click", closeMenu);
    $("[data-menu-cta]", overlay).addEventListener("click", function () {
      closeMenu();
      openLead(null);
    });
    return overlay;
  }

  function openMenu() {
    if (menuOverlay) return;
    menuOverlay = buildMenu();
    document.body.style.overflow = "hidden";
    // при открытии фокус уходит в панель: первый её элемент — «Закрыть меню»
    setTimeout(function () {
      var btn = $("[data-menu-close]", menuOverlay);
      if (btn) btn.focus();
    }, 80);
  }

  function closeMenu(restoreFocus) {
    if (!menuOverlay) return;
    var overlay = menuOverlay;
    menuOverlay = null;
    document.body.style.overflow = "";
    if (burger) burger.setAttribute("aria-expanded", "false");
    var finish = function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
    if (REDUCE) finish();
    else {
      overlay.classList.add("st-closing");
      setTimeout(finish, 180);
    }
    // возврат фокуса на бургер — стандарт диалога (Header.tsx: closeMenu)
    if (restoreFocus !== false && burger) burger.focus();
  }

  function initMenu() {
    burger = $('button[aria-label="Открыть меню"]');
    if (!burger) return;
    burger.setAttribute("aria-expanded", "false");
    burger.addEventListener("click", function () {
      burger.setAttribute("aria-expanded", "true");
      openMenu();
    });
    // меню открыто на мобильном, а вьюпорт растянули до lg — сброс
    var mq = window.matchMedia("(min-width: 64rem)");
    mq.addEventListener("change", function (e) {
      if (e.matches) closeMenu(false);
    });
  }

  /* ── Модалка заявки (LeadModal.tsx / LeadContext.tsx) ────────────── */

  var modalOverlay = null;
  var modalTrigger = null;

  function chipButtons(selected) {
    return ["Продать", "Купить", "Обменять", "Новостройка", "Ипотека", "Сопровождение", "Другое"]
      .map(function (t) {
        var on = t === selected;
        return '<button type="button" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) +
          '" class="' + (on ? CHIP_ON : CHIP_OFF) + '">' + t + "</button>";
      })
      .join("");
  }

  function buildModal(initialTask) {
    var overlay = document.createElement("div");
    overlay.className = "st-overlay fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6";
    overlay.setAttribute("data-modal-overlay", "");
    overlay.innerHTML =
      '<button type="button" aria-label="Закрыть" tabindex="-1" class="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" data-modal-backdrop></button>' +
      '<div role="dialog" aria-modal="true" aria-label="Заявка на консультацию" class="st-panel-modal relative flex max-h-[100dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-surface shadow-2xl shadow-ink/20 sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl">' +
      '  <button type="button" aria-label="Закрыть окно" class="absolute right-4 top-4 z-10 rounded-full bg-surface/90 p-2 text-ink-soft transition-colors hover:bg-paper hover:text-ink" data-modal-close>' + ICON_X + "</button>" +
      '  <div class="overflow-y-auto overscroll-contain p-6 sm:p-8">' +
      '    <h3 class="pr-8 text-xl font-bold tracking-[-0.01em]">Расскажите, что нужно сделать</h3>' +
      '    <p class="mt-1.5 text-sm leading-relaxed text-ink-soft">Оставьте номер и выберите задачу. Специалист свяжется с вами и уточнит детали.</p>' +
      '    <form class="mt-5 space-y-4">' +
      '      <div role="radiogroup" aria-label="Задача" class="flex flex-wrap gap-2">' + chipButtons(initialTask || "Продать") + "</div>" +
      // выбранная задача едет в FormData: чипы — радиогруппа без инпутов,
      // value синхронизирует обработчик wireRadiogroup ниже
      '      <input type="hidden" name="task" value="' + (initialTask || "Продать") + '"/>' +
      // «Другое» без места для рассказа оставляло бы заявку пустой:
      // поле раскрывается только для этой задачи
      '      <div class="-mx-1.5 overflow-hidden" data-modal-comment hidden>' +
      '        <div class="space-y-2 px-1.5 pb-1.5">' +
      '          <label for="lead-modal-comment" class="block text-sm font-semibold">Расскажите о ситуации <span class="font-normal text-ink-soft">(необязательно)</span></label>' +
      '          <textarea id="lead-modal-comment" name="comment" rows="3" placeholder="Кратко опишите задачу своими словами" class="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] placeholder:text-ink-soft/70 focus:border-wine"></textarea>' +
      "        </div>" +
      "      </div>" +
      '      <div class="space-y-2">' +
      '        <label for="lead-modal-name" class="block text-sm font-semibold">Имя</label>' +
      '        <input id="lead-modal-name" name="name" autocomplete="name" placeholder="Как к вам обращаться?" class="h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] placeholder:text-ink-soft/70 focus:border-wine"/>' +
      "      </div>" +
      '      <div class="space-y-2">' +
      '        <label for="lead-modal-phone" class="block text-sm font-semibold">Телефон</label>' +
      '        <input id="lead-modal-phone" name="phone" autocomplete="tel" inputmode="tel" placeholder="+7 900 000-00-00" class="h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] placeholder:text-ink-soft/70 focus:border-wine"/>' +
      "      </div>" +
      // honeypot для ботов, посетители поле не видят
      '      <input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" class="hidden"/>' +
      '      <label for="lead-modal-consent" class="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-ink-soft">' +
      '        <span class="relative mt-0.5 inline-flex h-5 w-5 shrink-0">' +
      '          <input id="lead-modal-consent" name="consent" type="checkbox" class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-line bg-surface transition-colors checked:border-wine checked:bg-wine"/>' +
      '          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" class="pointer-events-none absolute left-1 top-1 text-white opacity-0 transition-opacity peer-checked:opacity-100"><path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"></path></svg>' +
      "        </span>" +
      '        <span>Я даю <a href="consent.html" target="_blank" class="underline hover:text-ink">согласие на обработку персональных данных</a> в соответствии с <a href="privacy.html" target="_blank" class="underline hover:text-ink">политикой обработки персональных данных</a></span>' +
      "      </label>" +
      '      <button type="submit" class="h-12 w-full rounded-full bg-wine font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.98]">Отправить заявку</button>' +
      '      <p class="text-xs leading-relaxed text-ink-soft">Или позвоните: <a href="' + PHONE.href + '" class="tnum font-medium whitespace-nowrap text-ink underline">' + PHONE.display + "</a></p>" +
      "    </form>" +
      "  </div>" +
      "</div>";
    document.body.appendChild(overlay);

    var comment = $("[data-modal-comment]", overlay);
    var taskInput = $('input[name="task"]', overlay);
    // textarea скрытого поля disabled: disabled-поля не попадают в FormData,
    // поэтому комментарий от задачи «Другое» не уедет с другой задачей
    function syncComment(task) {
      comment.hidden = task !== "Другое";
      var ta = $("textarea", comment);
      if (ta) ta.disabled = comment.hidden;
    }
    wireRadiogroup($('[role="radiogroup"]', overlay), initialTask || "Продать", function (task) {
      syncComment(task);
      taskInput.value = task;
    });
    // initialTask задаёт состояние сразу: радиогруппа отрисовала выбранный
    // чип, поле «Другое» раскрыто и задача в FormData актуальны до первого
    // клика по чипу (в приложении initialTask едет в state модалки)
    syncComment(initialTask || "Продать");
    taskInput.value = initialTask || "Продать";
    $("[data-modal-backdrop]", overlay).addEventListener("click", closeModal);
    $("[data-modal-close]", overlay).addEventListener("click", closeModal);
    handleForm($("form", overlay), function () {
      // LeadModal.tsx: ветка success заменяет и заголовок, и форму
      var form = $("form", overlay);
      var content = form.parentElement;
      content.innerHTML = "";
      var success = buildSuccess("modal", closeModal);
      content.appendChild(success);
      $("h3", success).focus();
    });
    // Tab-ловушку и Escape обслуживает общий keydown-обработчик (initKeyboard)
    return overlay;
  }

  function openLead(trigger, initialTask) {
    if (modalOverlay) return;
    // триггер фиксируется ДО открытия: после закрытия фокус вернётся к нему
    modalTrigger = trigger || document.activeElement;
    if (modalTrigger && !(modalTrigger instanceof HTMLElement)) modalTrigger = null;
    modalOverlay = buildModal(initialTask);
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      var name = $("#lead-modal-name");
      if (name) name.focus();
    }, 80);
  }

  function closeModal() {
    if (!modalOverlay) return;
    var overlay = modalOverlay;
    var trigger = modalTrigger;
    modalOverlay = null;
    modalTrigger = null;
    document.body.style.overflow = "";
    var finish = function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      // Возврат фокуса триггеру (APG Dialog): только когда триггер жив
      // и фокус никому не принадлежит (LeadModal.tsx, cleanup)
      var active = document.activeElement;
      if (
        trigger &&
        trigger.isConnected &&
        (active === document.body || active == null)
      ) {
        trigger.focus();
      }
    };
    if (REDUCE) finish();
    else {
      overlay.classList.add("st-closing");
      setTimeout(finish, 180);
    }
  }

  // Кнопки-триггеры модалки: header CTA, hero CTA, карточки услуг,
  // финальный CTA (MobileBar CTA вешается при его создании)
  function initLeadTriggers() {
    $all("button").forEach(function (btn) {
      if (btn.closest("[data-modal-overlay], [data-menu-overlay]")) return;
      var text = btn.textContent.trim();
      var cards = btn.closest("#uslugi");
      if (cards && btn.querySelector("h3")) {
        var title = $("h3", btn);
        var task = title ? TASK_BY_TITLE[title.textContent.trim()] : null;
        btn.classList.add("open-modal");
        btn.addEventListener("click", function () { openLead(btn, task); });
      } else if (text === "Получить консультацию" || text === "Обсудить задачу") {
        btn.classList.add("open-modal");
        btn.addEventListener("click", function () { openLead(btn); });
      }
    });
  }

  /* ── FAQ (FAQ.tsx): aria-expanded toggle, один открытый вопрос ───── */

  function initFaq() {
    var section = $("#faq");
    if (!section) return;
    var items = $all("div.border-b.border-line", section);
    var openItem = null;

    items.forEach(function (item) {
      var btn = $("button", item);
      if (!btn) return;
      var q = $("span", btn);
      var data = FAQ_ITEMS.filter(function (f) { return f.q === q.textContent.trim(); })[0];
      if (!data) return;

      item.classList.add("st-faq-item");
      var answer = document.createElement("div");
      answer.className = "st-faq-answer";
      // свёрнутый ответ недоступен скринридеру: hidden снимается при
      // раскрытии и возвращается после анимации сворачивания
      answer.hidden = true;
      var p = document.createElement("p");
      p.className = "max-w-[68ch] pb-6 text-[15px] leading-relaxed text-ink-soft";
      p.textContent = data.a;
      answer.appendChild(p);
      item.appendChild(answer);

      // «плюс» поворачивается на 45°, как motion-анимация в FAQ.tsx
      var icon = btn.querySelector("span.shrink-0");
      if (icon) icon.classList.add("st-faq-icon");

      btn.addEventListener("click", function () {
        if (openItem === item) {
          collapse(item, btn);
          openItem = null;
          return;
        }
        if (openItem) {
          var b = $("button", openItem);
          collapse(openItem, b);
        }
        expand(item, btn);
        openItem = item;
      });
    });

    function expand(item, btn) {
      btn.setAttribute("aria-expanded", "true");
      item.classList.add("st-open");
      var box = $(".st-faq-answer", item);
      // снять hidden до анимации, затем reflow: высота идёт с 0, скринридер
      // видит ответ сразу после клика; источник правды — aria-expanded
      box.hidden = false;
      void box.offsetHeight;
      if (REDUCE) {
        box.style.height = "auto";
        return;
      }
      box.style.height = box.firstElementChild.offsetHeight + "px";
      var done = function () {
        box.removeEventListener("transitionend", done);
        if (item.classList.contains("st-open")) box.style.height = "auto";
      };
      box.addEventListener("transitionend", done);
      setTimeout(done, 350);
    }

    function collapse(item, btn) {
      btn.setAttribute("aria-expanded", "false");
      item.classList.remove("st-open");
      var box = $(".st-faq-answer", item);
      if (REDUCE) {
        box.style.height = "";
        box.hidden = true;
        return;
      }
      if (box.style.height === "auto") {
        box.style.height = box.firstElementChild.offsetHeight + "px";
        void box.offsetHeight; // reflow, чтобы переход пошёл с фикс. высоты
      }
      box.style.height = "";
      // hidden — после завершения анимации; если вопрос успели раскрыть
      // снова (st-open вернулся), скрывать нельзя
      var onEnd = function (e) {
        if (e.propertyName !== "height") return;
        box.removeEventListener("transitionend", onEnd);
        clearTimeout(timer);
        if (!item.classList.contains("st-open")) box.hidden = true;
      };
      var timer = setTimeout(function () {
        box.removeEventListener("transitionend", onEnd);
        if (!item.classList.contains("st-open")) box.hidden = true;
      }, 350);
      box.addEventListener("transitionend", onEnd);
    }
  }

  /* ── Карусель отзывов (Reviews.tsx) ──────────────────────────────── */

  function initCarousel() {
    var section = $("#otzyvy");
    if (!section) return;
    var container = $("div.overflow-hidden.rounded-2xl", section);
    var viewport = $('[aria-roledescription="карусель"]', section);
    var track = viewport ? viewport.firstElementChild : null;
    if (!container || !track) return;

    var GAP = 16; // Reviews.tsx: GAP
    var AUTOPLAY_MS = 6000; // Reviews.tsx: AUTOPLAY_S
    var slides = $all(":scope > figure", track);
    var count = slides.length;
    if (count === 0) return;
    var dotsWrap = $('[aria-label="Отзывы"]', container);
    var dots = $all("button", dotsWrap);
    var index = 0;
    var step = viewport.clientWidth + GAP;
    var inView = true;
    var hover = false;
    var focusIn = false;
    var dragging = false;
    // постоянная пауза автоплея кнопкой: отдельно от временных hover/focus
    var userPaused = false;
    var progress = REDUCE ? 1 : 0;
    var lastTs = null;
    var progressEl = null;

    track.classList.add("st-carousel-track");

    function renderSlides() {
      slides.forEach(function (slide, i) {
        // inert у невидимых слайдов: ссылка «Источник» не попадает в таб-порядок
        if (i === index) slide.removeAttribute("inert");
        else slide.setAttribute("inert", "");
      });
    }

    function renderDots() {
      progressEl = null;
      dots.forEach(function (dot, i) {
        var on = i === index;
        if (on) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
        var span = dot.firstElementChild;
        span.className =
          "relative block h-1.5 overflow-hidden rounded-full transition-all duration-300 " +
          (on ? "w-8 bg-wine/20" : "w-1.5 bg-wine/25 group-hover/dot:bg-wine/45");
        span.innerHTML = "";
        if (on) {
          // полоса прогресса автоплея живёт только на активной точке
          progressEl = document.createElement("span");
          progressEl.setAttribute("aria-hidden", "true");
          progressEl.className = "absolute inset-0 origin-left rounded-full bg-wine";
          progressEl.style.transform = "scaleX(" + progress + ")";
          span.appendChild(progressEl);
        }
      });
    }

    function renderProgress() {
      if (progressEl) progressEl.style.transform = "scaleX(" + progress + ")";
    }

    function goTo(next) {
      index = ((next % count) + count) % count; // по кругу, как в Reviews.tsx
      progress = REDUCE ? 1 : 0;
      lastTs = null;
      track.style.transform = "translateX(" + (-index * step) + "px)";
      renderSlides();
      renderDots();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { goTo(i); });
    });
    var prevBtn = $('button[aria-label="Предыдущий отзыв"]', container);
    var nextBtn = $('button[aria-label="Следующий отзыв"]', container);
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(index - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(index + 1); });

    // кнопка «Пауза/Продолжить» (фича ревью): в стиле круглых стрелок,
    // между точками и стрелками; userPaused — отдельно от hover/focus
    var ICON_PAUSE =
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M88,44h16a12,12,0,0,1,12,12v144a12,12,0,0,1-12,12H88a12,12,0,0,1-12-12V56A12,12,0,0,1,88,44Zm64,0h16a12,12,0,0,1,12,12v144a12,12,0,0,1-12,12h-16a12,12,0,0,1-12-12V56A12,12,0,0,1,152,44Z"></path></svg>';
    var ICON_PLAY =
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M96,64l80,64-80,64" fill="currentColor" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    var pauseBtn = document.createElement("button");
    pauseBtn.type = "button";
    pauseBtn.className =
      "flex h-10 w-10 items-center justify-center rounded-full border border-wine/25 text-wine transition-colors hover:border-wine/50";
    function renderPauseBtn() {
      pauseBtn.setAttribute("aria-pressed", userPaused ? "true" : "false");
      pauseBtn.setAttribute(
        "aria-label",
        userPaused
          ? "Продолжить автопрокрутку отзывов"
          : "Поставить автопрокрутку отзывов на паузу"
      );
      pauseBtn.innerHTML = userPaused ? ICON_PLAY : ICON_PAUSE;
    }
    pauseBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      renderPauseBtn();
    });
    renderPauseBtn();
    if (prevBtn) prevBtn.insertAdjacentElement("beforebegin", pauseBtn);

    // пауза и под курсором, и пока внутри фокус клавиатуры (WCAG 2.2.2);
    // фокус на самой кнопке паузы автопрокрутку НЕ останавливает — иначе
    // «Продолжить» не сработало бы, пока кнопка в фокусе
    container.addEventListener("pointerenter", function () { hover = true; });
    container.addEventListener("pointerleave", function () { hover = false; });
    container.addEventListener("focusin", function (e) {
      focusIn = e.target !== pauseBtn;
    });
    container.addEventListener("focusout", function (e) {
      if (container.contains(e.relatedTarget)) return;
      focusIn = false;
    });

    // пауза: постоянная кнопкой + временные hover и фокус клавиатуры
    // (WCAG 2.2.2); прогресс-полоса замирает по месту
    function paused() { return userPaused || hover || focusIn || dragging; }

    // автоплей: прогресс 0..1 за 6 с, затем следующий слайд
    function tick(ts) {
      if (lastTs == null) lastTs = ts;
      var dt = ts - lastTs;
      lastTs = ts;
      if (!REDUCE && inView && !paused()) {
        progress += dt / AUTOPLAY_MS;
        if (progress >= 1) {
          progress = 1;
          renderProgress();
          goTo(index + 1);
          requestAnimationFrame(tick);
          return;
        }
        renderProgress();
      }
      requestAnimationFrame(tick);
    }
    if (!REDUCE) requestAnimationFrame(tick);

    // автоплей работает только когда карусель в вьюпорте (useInView 0.35)
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      progress = REDUCE ? 1 : 0;
      lastTs = null;
    }, { threshold: 0.35 }).observe(viewport);

    // ширина может меняться: пересчёт шага (ResizeObserver, как в Reviews)
    if (typeof ResizeObserver === "function") {
      new ResizeObserver(function () {
        step = viewport.clientWidth + GAP;
        track.style.transform = "translateX(" + (-index * step) + "px)";
      }).observe(viewport);
    }

    // pointer-drag: прилипание к ближайшему слайду, упругость 0.12
    var downX = 0, downY = 0, baseX = 0, lastX = 0, lastT = 0, vx = 0, pid = null, axis = null, curX = 0;

    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pid = e.pointerId;
      axis = null;
      dragging = false;
      downX = e.clientX;
      downY = e.clientY;
      baseX = -index * step;
      lastX = e.clientX;
      lastT = performance.now();
      vx = 0;
    });

    track.addEventListener("pointermove", function (e) {
      if (e.pointerId !== pid) return;
      var dx = e.clientX - downX;
      var dy = e.clientY - downY;
      if (axis === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (axis === "x") {
          dragging = true;
          track.classList.add("st-dragging");
          try { track.setPointerCapture(pid); } catch (err) { /* ignore */ }
        }
      }
      if (axis !== "x") return;
      var raw = baseX + dx;
      var min = -(count - 1) * step;
      // dragElastic 0.12: за границами трек тянется с сопротивлением
      if (raw > 0) raw = raw * 0.12;
      else if (raw < min) raw = min + (raw - min) * 0.12;
      curX = raw;
      track.style.transform = "translateX(" + raw + "px)";
      var now = performance.now();
      if (now > lastT) {
        vx = ((e.clientX - lastX) / (now - lastT)) * 1000; // px/s
        lastX = e.clientX;
        lastT = now;
      }
      e.preventDefault();
    });

    function endDrag(e) {
      if (e.pointerId !== pid) return;
      pid = null;
      if (axis !== "x") { axis = null; return; }
      axis = null;
      track.classList.remove("st-dragging");
      // проекция с инерцией: momentum выключен, но бросок учитывается
      // (Reviews.tsx: projected = -x - velocity.x * 0.2)
      var projected = -curX - vx * 0.2;
      var target = Math.max(0, Math.min(count - 1, Math.round(projected / step)));
      goTo(target);
      dragging = false;
    }
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);

    renderSlides();
    renderDots();
  }

  /* ── Нижняя мобильная панель (MobileBar.tsx) ─────────────────────── */

  function initMobileBar() {
    var bar = document.createElement("div");
    bar.className = "st-mobilebar fixed inset-x-0 bottom-0 z-30 sm:hidden";
    bar.setAttribute("data-mobilebar", "");
    bar.innerHTML =
      '<div class="border-t border-line bg-surface/90 p-3 backdrop-blur-xl">' +
      '  <div class="flex gap-2.5">' +
      '    <a href="' + PHONE.href + '" aria-label="Позвонить: ' + PHONE.display + '" class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line text-wine transition-colors active:bg-paper">' + ICON_PHONE + "</a>" +
      '    <button type="button" class="h-12 flex-1 rounded-full bg-wine font-semibold text-white transition-colors hover:bg-wine-deep active:scale-[0.99]" data-mobilebar-cta>Получить консультацию</button>' +
      "  </div>" +
      "</div>";
    document.body.appendChild(bar);
    var cta = $("[data-mobilebar-cta]", bar);
    cta.classList.add("open-modal");
    cta.addEventListener("click", function () { openLead(cta); });
    // появляется после первого экрана: scrollY > innerHeight * 0.7
    var onScroll = function () {
      bar.classList.toggle("st-visible", window.scrollY > window.innerHeight * 0.7);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── Глобальная клавиатура: Escape и Tab ─────────────────────────── */

  function initKeyboard() {
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (modalOverlay) closeModal();
        else if (menuOverlay) closeMenu();
        return;
      }
      if (e.key === "Tab") {
        // как в приложении: Tab не уходит под активный оверлей
        if (modalOverlay) {
          var dialog = $("[role=dialog]", modalOverlay);
          if (dialog) trapTabKey(e, dialog);
        } else if (menuOverlay) {
          var panel = $("#mobile-menu");
          if (panel) trapTabKey(e, panel);
        }
      }
    });
  }

  /* ── Салют конфетти (confetti.ts) ──────────────────────────────────
   * Web Animations API, только transform/opacity, частицы удаляются по
   * окончании. Порт один в один: палитра, веер −165°…−15°, easing. */
  var CONFETTI_COLORS = ["#7d1b24", "#5e1119", "#d98e3b", "#e9b77c", "#e7c3be"];
  var BURST_EASING = "cubic-bezier(0.23, 1, 0.32, 1)";
  var GRAVITY_EASING = "cubic-bezier(0.55, 0, 1, 0.45)";

  function rand(min, max) { return min + Math.random() * (max - min); }

  function burstConfetti(host, count) {
    var n = count || 22;
    for (var i = 0; i < n; i++) {
      var piece = document.createElement("span");
      // ленточки и кружочки: ленточки вращаются заметнее
      var ribbon = i % 5 < 3;
      var w = ribbon ? rand(3, 4.5) : rand(4.5, 6);
      var h = ribbon ? rand(7, 10) : w;
      piece.style.position = "absolute";
      piece.style.left = -w / 2 + "px";
      piece.style.top = -h / 2 + "px";
      piece.style.width = w + "px";
      piece.style.height = h + "px";
      piece.style.borderRadius = ribbon ? "1px" : "50%";
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      piece.style.opacity = "0";
      piece.style.willChange = "transform, opacity";
      host.appendChild(piece);

      // веер вверх от −165° до −15°, без полёта строго вниз в текст
      var angle = (rand(-165, -15) * Math.PI) / 180;
      var dist = rand(60, 130);
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist;
      var fall = rand(50, 110);
      var spin = (Math.random() < 0.5 ? -1 : 1) * rand(ribbon ? 240 : 90, ribbon ? 600 : 240);

      var animation = piece.animate(
        [
          { transform: "translate(0, 0) rotate(0deg) scale(0.6)", opacity: 0, easing: BURST_EASING },
          { opacity: 1, offset: 0.06, easing: BURST_EASING },
          {
            transform: "translate(" + dx * 0.85 + "px, " + dy + "px) rotate(" + spin * 0.45 + "deg) scale(1)",
            opacity: 1,
            offset: 0.42,
            easing: GRAVITY_EASING,
          },
          {
            transform: "translate(" + dx + "px, " + (dy + fall) + "px) rotate(" + spin + "deg) scale(0.85)",
            opacity: 0,
          },
        ],
        { duration: rand(1000, 1400), delay: rand(0, 70), fill: "forwards" }
      );
      animation.onfinish = function () { this.effect.target.remove(); };
    }
  }

  /* ── Этапы сделки (DealRoute.tsx) ──────────────────────────────────
   * Серая линия-маршрут есть в SSR; винтовая прорисовывается скроллом
   * (scaleY по scrollYProgress), кружок шага заливается бордовым с
   * белой иконкой, когда линия доходит до шага. Прогресс — как
   * useScroll offset ["start 0.75", "end 0.7"]. */
  function initDealRoute() {
    var section = $("#process");
    if (!section) return;
    var list = $("ol", section);
    var grayLine = section.querySelector('div[class*="bg-line"]');
    if (!list || !grayLine) return;
    var circles = $all("li > span.relative.z-10", list);
    if (circles.length < 2) return;
    // заливки шагов ведёт этот модуль, reveal-observer их не трогает
    circles.forEach(function (c) { c.setAttribute("data-step-marker", ""); });

    var n = circles.length;
    var wineLine = document.createElement("div");
    wineLine.setAttribute("aria-hidden", "true");
    wineLine.className =
      "absolute bottom-8 left-[27px] top-8 w-px origin-top bg-wine sm:left-[31px]";
    grayLine.insertAdjacentElement("afterend", wineLine);

    // StepFill: бордовый круг с той же иконкой в белом поверх
    var overlays = circles.map(function (circle) {
      var overlay = document.createElement("span");
      overlay.setAttribute("aria-hidden", "true");
      overlay.className =
        "absolute inset-0 z-20 flex items-center justify-center rounded-full bg-wine text-white";
      overlay.style.opacity = "0";
      var icon = $("svg", circle);
      if (icon) {
        var clone = icon.cloneNode(true);
        clone.removeAttribute("class"); // текст-цвет наследует text-white
        overlay.appendChild(clone);
      }
      circle.appendChild(overlay);
      return overlay;
    });

    function update() {
      var rect = list.getBoundingClientRect();
      // offset ["start 0.75", "end 0.7"]: p=0 — верх списка на линии 75%
      // вьюпорта, p=1 — низ списка на линии 70%
      var p = (window.innerHeight * 0.75 - rect.top) / (rect.height + window.innerHeight * 0.05);
      p = Math.max(0, Math.min(1, REDUCE ? 1 : p));
      wineLine.style.transform = "scaleY(" + p + ")";
      overlays.forEach(function (overlay, i) {
        var t = i / (n - 1);
        var lo = Math.max(0, t - 0.05), hi = Math.min(1, t + 0.02);
        var fill = Math.max(0, Math.min(1, (p - lo) / (hi - lo)));
        overlay.style.opacity = String(REDUCE ? 1 : fill);
      });
    }

    document.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    // reduce на живой странице: линия целиком (scaleY 1), заливки все
    reduceHandlers.push(update);
  }

  /* ── Манифест (Manifesto.tsx) ──────────────────────────────────────
   * Слова абзаца проявляются из opacity 0.14 в 1 по мере прокрутки:
   * слово i живёт в окне прогресса [i/n, (i+1)/n]. Прогресс — как
   * useScroll offset ["start 0.85", "end 0.5"]. В статике слова
   * оборачиваются в спаны на клиенте, как после hydration в приложении;
   * при reduced-motion текст остаётся цельным (как до маунта). */
  function initManifesto() {
    var p = null;
    $all("section p").forEach(function (el) {
      if (!p && el.textContent.indexOf("Мы не сетевой гигант") === 0) p = el;
    });
    if (!p || REDUCE) return;
    var words = p.textContent.trim().split(/\s+/);
    var total = words.length;
    var spans = words.map(function (word) {
      var span = document.createElement("span");
      span.className = "inline";
      span.textContent = word;
      p.appendChild(span);
      p.appendChild(document.createTextNode(" "));
      return span;
    });
    p.textContent = "";
    spans.forEach(function (span) {
      p.appendChild(span);
      p.appendChild(document.createTextNode(" "));
    });

    function update() {
      var rect = p.getBoundingClientRect();
      // offset ["start 0.85", "end 0.5"]
      var progress = (window.innerHeight * 0.85 - rect.top) / (rect.height + window.innerHeight * 0.35);
      progress = Math.max(0, Math.min(1, progress));
      spans.forEach(function (span, i) {
        var start = i / total, end = (i + 1) / total;
        var local = Math.max(0, Math.min(1, (progress - start) / (end - start)));
        span.style.opacity = String(0.14 + local * 0.86);
      });
    }

    document.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    // reduce на живой странице: все слова в финальную непрозрачность
    reduceHandlers.push(function () {
      if (!REDUCE) { update(); return; }
      spans.forEach(function (span) { span.style.opacity = "1"; });
    });
  }

  /* ── Линия таймлайна в «Безопасности» (Safety.tsx) ─────────────────
   * В приложении SVG-змейку строит useEffect по реальным позициям
   * маркеров (перестраивается на ресайзе), сплошная бордовая линия
   * прорисовывается скроллом (pathLength по scrollYProgress), а маркеры
   * заливаются бордовым, когда тропа доходит до шага. Портируем это
   * один в один: геометрия та же (R_MAX=64, скруглённые повороты),
   * прогресс = (0.72*vh - верх трека) / высота трека, как
   * useScroll offset ["start 0.72", "end 0.72"]. */
  var SVG_NS = "http://www.w3.org/2000/svg";

  function initSafetyRoute() {
    var section = null;
    $all("h2").forEach(function (h2) {
      if (!section && h2.textContent.indexOf("Критические этапы сделки под контролем") !== -1) {
        section = h2.closest("section");
      }
    });
    if (!section) return;
    var track = section.querySelector("div.relative.mt-14");
    if (!track) return;
    var markers = $all(
      '[class*="relative z-10 flex h-12 w-12"], [class*="relative z-10 flex h-16 w-16"]',
      section
    );
    if (markers.length < 2) return;
    // заливки маркеров дальше ведёт этот модуль, reveal-observer их не трогает
    markers.forEach(function (m) { m.setAttribute("data-stop-marker", ""); });

    var R_MAX = 64;
    var svg = null, dashed = null, solid = null, thresholds = [0], fillWindows = [];
    // салют (Safety.tsx): host — точка в центре финального маркера,
    // пересечение p=0.999 снизу, один раз за визит
    var burstHost = $('span[class*="left-1/2 top-1/2"]', markers[markers.length - 1]) || null;
    var celebrated = false;
    var prevP = 0;

    // layout-позиции (offset*), а не getBoundingClientRect: reveal-сдвиги
    // трансформой не учитываются (комментарий из Safety.tsx)
    function layoutCenter(el) {
      var x = el.offsetWidth / 2, y = el.offsetHeight / 2, node = el;
      while (node && node !== track) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent;
      }
      return node === track ? { x: x, y: y } : null;
    }

    function build() {
      var pts = markers.map(layoutCenter).filter(Boolean);
      if (pts.length < 2) return;
      var d = "M " + pts[0].x + " " + pts[0].y;
      var cumLen = [0];
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], dx = b.x - a.x;
        if (Math.abs(dx) < 1) {
          d += " L " + b.x + " " + b.y;
          cumLen.push(cumLen[i - 1] + Math.hypot(dx, b.y - a.y));
          continue;
        }
        var r = Math.min(R_MAX, Math.abs(dx) / 2, Math.abs(b.y - a.y) / 2);
        var sx = dx < 0 ? -1 : 1;
        d += " L " + a.x + " " + (b.y - r);
        d += " Q " + a.x + " " + b.y + ", " + (a.x + sx * r) + " " + b.y;
        d += " L " + b.x + " " + b.y;
        // длина дуги: сэмплируем квадратичную Безье (как в Safety.tsx)
        var arc = 0, prev = { x: a.x, y: b.y - r };
        for (var s = 1; s <= 16; s++) {
          var t = s / 16, u = 1 - t;
          var q = { x: a.x + sx * r * t * t, y: b.y - r * u * u };
          arc += Math.hypot(q.x - prev.x, q.y - prev.y);
          prev = q;
        }
        var seg = Math.abs(b.y - r - a.y) + arc + Math.abs(b.x - (a.x + sx * r));
        cumLen.push(cumLen[i - 1] + seg);
      }
      var total = cumLen[cumLen.length - 1] || 1;
      thresholds = cumLen.map(function (v) { return v / total; });
      // Окна заливки из ФАКТИЧЕСКОЙ длины пути (тот же проход, что и path):
      // заливка маркера начинается, когда кончик линии доходит до КРАЯ его
      // кружка (cumLen[i] − радиус), и полна, когда кончик в центре. Так
      // линия никогда не опережает заливку на любой ширине: у финального
      // кружка после поворота трассы фиксированное окно ±0.015 от total
      // давало 8–10px «линия внутри незалитого кружка» на 390/360/320.
      var radii = markers.map(function (m) { return m.offsetWidth / 2; });
      fillWindows = cumLen.map(function (v, i) {
        var end = v / total;
        var start = i === 0 ? 0 : Math.max(0, (v - radii[i]) / total);
        if (i === 0) end = 0.015; // первый: окно [0, 0.015], как в оригинале
        return { start: start, end: Math.max(start, Math.min(1, end)) };
      });

      var w = track.offsetWidth, h = track.offsetHeight;
      if (!svg) {
        svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("class", "pointer-events-none absolute inset-0");
        svg.setAttribute("fill", "none");
        dashed = document.createElementNS(SVG_NS, "path");
        dashed.setAttribute("stroke", "var(--line)");
        dashed.setAttribute("stroke-width", "2");
        dashed.setAttribute("stroke-linecap", "round");
        dashed.setAttribute("stroke-dasharray", "1 8");
        solid = document.createElementNS(SVG_NS, "path");
        solid.setAttribute("stroke", "var(--wine)");
        solid.setAttribute("stroke-width", "2");
        solid.setAttribute("stroke-linecap", "round");
        solid.setAttribute("pathLength", "1"); // нормируем длину для прорисовки
        solid.style.strokeDasharray = "1 1";
        svg.appendChild(dashed);
        svg.appendChild(solid);
        track.insertBefore(svg, track.firstChild);
      }
      svg.setAttribute("width", w);
      svg.setAttribute("height", h);
      svg.setAttribute("viewBox", "0 0 " + w + " " + h);
      dashed.setAttribute("d", d);
      solid.setAttribute("d", d);
      update();
    }

    function update() {
      if (!solid) return;
      var rect = track.getBoundingClientRect();
      var p = (window.innerHeight * 0.72 - rect.top) / rect.height;
      p = Math.max(0, Math.min(1, REDUCE ? 1 : p));
      solid.style.strokeDashoffset = String(1 - p);
      // заливка по окнам из геометрии пути (build): старт у края кружка,
      // полная в центре — линия и заливка синхронны в каждом положении
      markers.forEach(function (m, i) {
        var overlay = m.querySelector("span.absolute.inset-0");
        if (!overlay) return;
        var win = fillWindows[i] || { start: 0, end: 0.015 };
        var fill = Math.max(0, Math.min(1, (p - win.start) / (win.end - win.start)));
        overlay.style.opacity = String(REDUCE ? 1 : fill);
      });
      // салют: один раз за визит при пересечении 0.999 снизу и только
      // когда финальная точка на экране (условия из Safety.tsx)
      if (REDUCE || celebrated || p < 0.999 || prevP >= 0.999) {
        prevP = p;
        return;
      }
      if (burstHost) {
        var hostTop = burstHost.getBoundingClientRect().top;
        if (hostTop >= 0 && hostTop <= window.innerHeight) {
          celebrated = true;
          burstConfetti(burstHost);
        }
      }
      prevP = p;
    }

    build();
    if (typeof ResizeObserver === "function") {
      new ResizeObserver(build).observe(track);
    }
    document.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    // reduce на живой странице: линия целиком, заливки все (update читает REDUCE)
    reduceHandlers.push(update);
  }

  /* ── Появление блоков (entrance-анимации приложения) ───────────────
   * SSR-разметка содержит элементы с inline opacity:0 — начальное
   * состояние framer-motion, которое без React навсегда невидимо:
   * hero (y:24), шаги маршрута и «Ключи у вас» (y:16), оверлеи маркеров
   * (только opacity). Показываем один раз при входе во вьюпорт, как
   * whileInView с once:true; одновременно вошедшие — с лёгким стаггером. */
  function initReveal() {
    var els = $all('[style*="opacity:0"]').filter(function (el) {
      // ровно ноль, не 0.xxx; заливки маркеров таймлайна (data-stop-marker)
      // и шагов маршрута (data-step-marker) ведут их scroll-модули
      return (
        el.style.opacity === "0" &&
        !el.closest("[data-stop-marker]") &&
        !el.closest("[data-step-marker]")
      );
    });
    if (!els.length) return;
    var reveal = function (el) {
      // в reduce — мгновенно, без 0.6s-перехода
      if (!REDUCE) {
        el.style.transition =
          "opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1)";
      } else {
        el.style.transition = "none";
      }
      el.style.opacity = "1";
      el.style.transform = "none";
    };
    if (REDUCE || !("IntersectionObserver" in window)) {
      els.forEach(reveal);
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries
        .filter(function (entry) { return entry.isIntersecting; })
        .forEach(function (entry, i) {
          obs.unobserve(entry.target); // once: true
          setTimeout(function () { reveal(entry.target); }, i * 90);
        });
    }, { threshold: 0.15 });
    els.forEach(function (el) { obs.observe(el); });
    // reduce включили на живой странице: недоскрытые элементы — сразу
    reduceHandlers.push(function () {
      if (!REDUCE) return;
      els.forEach(function (el) {
        if (el.style.opacity === "0") reveal(el);
      });
    });
  }

  /* ── Запуск ──────────────────────────────────────────────────────── */

  initHeader();
  initSafetyRoute(); // до initReveal: помечает заливки маркеров (data-stop-marker)
  initDealRoute(); // до initReveal: помечает заливки шагов (data-step-marker)
  initManifesto();
  initReveal();
  initMenu();
  initLeadTriggers();
  initSectionForm();
  initFaq();
  initCarousel();
  initMobileBar();
  initKeyboard();
})();
