const C = {
        date: "2028-06-23",
        tz: "+07:00",
        akad: "09:00",
        resepsi: "19:00",
        venue: "Kediaman mempelai wanita",
        addr: "Jl. Mangga no.20",
        gifts: [
          { n: "BCA", no: "1234679999", an: "M. Sholihin" },
          { n: "Dana", no: "08111222333", an: "M. Sholihin" },
        ],
      };
      const $ = (s) => document.querySelector(s),
        $$ = (s) => [...document.querySelectorAll(s)],
        at = (t) => new Date(`${C.date}T${t}:00${C.tz}`);
      const day = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(at(C.akad));
      const [y, m, d] = C.date.split("-");
      $("#cd").textContent = `${d}-${m}-${y}`;
      $("#ev").innerHTML = [
        ["Akad Nikah", C.akad],
        ["Resepsi", C.resepsi],
      ]
        .map(
          ([t, h]) =>
            `<article class="card rv" data-tilt="5"><h2 class="script">${t}</h2><p>${day}</p><p>Pukul ${h.replace(":", ".")} WIB</p><p>${C.venue}</p><p>${C.addr}</p></article>`,
        )
        .join("");
      $("#gf").innerHTML = C.gifts
        .map(
          (g, i) =>
            `<div class="card gift rv" data-tilt="5"><b>${g.n}</b><div class="no">${g.no}</div><p class="small">a.n ${g.an}</p><button class="btn" data-no="${g.no}">Salin nomor</button></div>`,
        )
        .join("");
      $("#map").href =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(C.addr);
      const z = (t) => t.toISOString().replace(/[-:]|\.\d{3}/g, "");
      $("#cal").href =
        `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Pernikahan Ayna & Sholihin")}&dates=${z(at(C.akad))}/${z(new Date(at(C.resepsi).getTime() + 72e5))}&location=${encodeURIComponent(C.venue + ", " + C.addr)}`;
      const gn = location.hash.match(/^#untuk-(.+)/);
      if (gn) {
        $("#guest b").textContent = gn[1]
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        $("#guest").hidden = false;
      }
      /* hitung mundur */
      const cells = $$(".cd b");
      function tick() {
        const s = Math.max(0, Math.floor((at(C.akad) - Date.now()) / 1e3)),
          v = [
            Math.floor(s / 86400),
            Math.floor((s % 86400) / 3600),
            Math.floor((s % 3600) / 60),
            s % 60,
          ];
        cells.forEach((e, i) => {
          const t = String(v[i]).padStart(2, "0");
          if (e.textContent !== t) {
            e.textContent = t;
            e.classList.remove("f");
            void e.offsetWidth;
            e.classList.add("f");
          }
        });
      }
      tick();
      setInterval(tick, 1000);
      /* kemunculan, paralaks, miring 3D */
      $$(".sec").forEach((s) =>
        s
          .querySelectorAll(".rv,.ink")
          .forEach((e, i) => e.style.setProperty("--i", i)),
      );
      const io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.2 },
      );
      $$(".sec").forEach((s) => io.observe(s));
      const secs = $$(".sec");
      let rq = 0;
      const par = () => {
        rq = 0;
        const h = innerHeight;
        secs.forEach((s) => {
          const r = s.getBoundingClientRect();
          if (r.bottom > 0 && r.top < h)
            s.style.setProperty(
              "--p",
              ((r.top + r.height / 2 - h / 2) * 0.07).toFixed(1),
            );
        });
      };
      addEventListener(
        "scroll",
        () => rq || (rq = requestAnimationFrame(par)),
        { passive: true },
      );
      par();
      $$("[data-tilt]").forEach((el) => {
        const k = +el.dataset.tilt;
        el.addEventListener("pointermove", (e) => {
          if (el.dataset.lock) return;
          const r = el.getBoundingClientRect(),
            x = (e.clientX - r.left) / r.width - 0.5,
            y = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(700px) rotateY(${x * k * 2}deg) rotateX(${-y * k * 2}deg)`;
        });
        el.addEventListener("pointerleave", () => {
          if (!el.dataset.lock) el.style.transform = "";
        });
      });
      /* suara */
      let ac,
        mg,
        on = true;
      const sl = (k) => 261.63 * 2 ** (k * 0.2);
      function bell(f, t = 0, v = 0.06, dur = 3) {
        if (!ac) return;
        const n = ac.currentTime + t;
        [
          [1, 1],
          [2.76, 0.35],
          [5.4, 0.12],
        ].forEach(([r, g]) => {
          const o = ac.createOscillator(),
            a = ac.createGain();
          o.frequency.value = f * r;
          a.gain.setValueAtTime(0, n);
          a.gain.linearRampToValueAtTime(v * g, n + 0.01);
          a.gain.exponentialRampToValueAtTime(0.0001, n + dur / Math.sqrt(r));
          o.connect(a).connect(mg);
          o.start(n);
          o.stop(n + dur);
        });
      }
      function whoosh() {
        const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate),
          a = b.getChannelData(0);
        for (let i = 0; i < a.length; i++)
          a[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / a.length);
        const s = ac.createBufferSource(),
          f = ac.createBiquadFilter(),
          g = ac.createGain(),
          t = ac.currentTime;
        f.type = "bandpass";
        f.frequency.setValueAtTime(400, t);
        f.frequency.exponentialRampToValueAtTime(3200, t + 0.9);
        g.gain.value = 0.16;
        s.buffer = b;
        s.connect(f).connect(g).connect(mg);
        s.start();
      }
      const seq = [0, 2, 4, 2, 1, 3, 4, 3];
      let n = 0;
      function loop() {
        if (on) {
          bell(sl(seq[n % 8]), 0, 0.035, 2.6);
          if (n % 8 == 0) bell(sl(-5), 0, 0.05, 5);
        }
        n++;
        setTimeout(loop, 1700);
      }
      const gnm = $("#guest").hidden
        ? "Bapak/Ibu/Saudara/i"
        : $("#guest b").textContent;
      $("#lt").innerHTML =
        '<span class="pp"><img class="m" src="' +
        $(".mono").src +
        '" alt=""><span class="a ar">السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ</span><span class="g">Kepada Yth.<b>' +
        gnm +
        '</b></span><span class="n script">Ayna &amp; Sholihin</span><span class="x">Dengan hormat, kami mengundang Anda di hari bahagia kami</span></span>';
      let stage = 0;
      function step1() {
        if (stage) return;
        stage = 1;
        const eb = $("#eb"),
          fp = $("#fp"),
          cv = $("#cover");
        eb.dataset.lock = 1;
        eb.style.transform = "";
        $("#ew").classList.add("stop");
        cv.classList.add("open");
        try {
          ac = new (window.AudioContext || window.webkitAudioContext)();
          mg = ac.createGain();
          mg.connect(ac.destination);
          whoosh();
          bell(2400, 0, 0.05, 0.3);
        } catch (e) {}
        fp.classList.add("o", "br");
        setTimeout(() => (fp.style.zIndex = 2), 380);
        setTimeout(() => {
          $("#lt").classList.add("up");
          $("#ew").classList.add("shelf");
        }, 650);
        setTimeout(() => $("#lt").classList.add("fz", "fw"), 1500);
        setTimeout(() => {
          stage = 2;
          $("#lt").classList.add("rdy");
          cv.classList.add("ready");
        }, 2450);
      }
      $("#open").onclick = $("#eb").onclick = step1;
      $("#eb").onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          step1();
        }
      };
      $("#lt").onclick = () => {
        if (stage !== 2) return;
        stage = 3;
        const L = $("#lt"),
          cv = $("#cover"),
          fp = $("#fp"),
          ew = $("#ew");
        L.classList.remove("rdy", "fw");
        cv.classList.remove("ready");
        try {
          whoosh();
        } catch (x) {}
        setTimeout(() => L.classList.remove("fz", "up"), 800);
        setTimeout(() => {
          fp.style.zIndex = 5;
          fp.classList.remove("o");
          try {
            bell(1500, 0.5, 0.04, 0.3);
          } catch (x) {}
        }, 1800);
        setTimeout(() => {
          cv.classList.add("unfold");
          ew.classList.add("leave");
          document.body.classList.remove("lock");
          scrollTo(0, 0);
          $("#snd").hidden = false;
          try {
            [0, 2, 4, 5].forEach((k, j) =>
              bell(sl(k) * 2, 0.2 + j * 0.18, 0.07, 3.5),
            );
          } catch (x) {}
          setTimeout(loop, 2600);
        }, 2750);
        setTimeout(() => cv.classList.add("gone"), 3900);
      };
      $("#snd").onclick = (e) => {
        on = !on;
        if (mg) mg.gain.value = on ? 1 : 0;
        e.currentTarget.classList.toggle("off", !on);
        e.currentTarget.setAttribute("aria-pressed", on);
      };
      /* salin nomor */
      $$("[data-no]").forEach(
        (b) =>
          (b.onclick = async () => {
            const t = b.dataset.no;
            try {
              await navigator.clipboard.writeText(t);
            } catch (e) {
              const x = document.createElement("textarea");
              x.value = t;
              document.body.appendChild(x);
              x.select();
              try {
                document.execCommand("copy");
              } catch (_) {}
              x.remove();
            }
            bell(1800, 0, 0.05, 0.25);
            const o = b.textContent;
            b.textContent = "Tersalin";
            setTimeout(() => (b.textContent = o), 1600);
          }),
      );
