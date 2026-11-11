// ==UserScript==
// @name         iSmart PRO Telegram Bridge
// @namespace    https://edu.ismart.org/
// @version      3.0.0
// @description  Автоматическое решение любых тестов на платформе iSmart на 100% через защищённого Telegram-бота @smartgdz_app_bot в 1 клик
// @author       iSmart PRO Team
// @match        https://edu.ismart.org/*
// @updateURL    https://raw.githubusercontent.com/romaleks098/ismart-pro/main/ismart.user.js
// @downloadURL  https://raw.githubusercontent.com/romaleks098/ismart-pro/main/ismart.user.js
// @icon         https://edu.ismart.org/favicon.ico
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @grant        window.focus
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const BACKEND_URL = 'https://ismart-bot.onrender.com';
    let isRequesting = false;

    function injectStyles() {
        if (document.getElementById('ismart-pro-styles')) return;
        const style = document.createElement('style');
        style.id = 'ismart-pro-styles';
        style.textContent = `
            #ismart-pro-root {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 99999999;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                font-size: 14px;
                line-height: 1.4;
                color: #f8fafc;
                box-sizing: border-box;
            }
            #ismart-pro-root * {
                box-sizing: border-box;
            }
            #ismart-pro-pill {
                display: flex;
                align-items: center;
                gap: 8px;
                background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
                color: #ffffff;
                padding: 10px 18px;
                border-radius: 999px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                cursor: pointer;
                font-weight: 700;
                font-size: 14px;
                user-select: none;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            }
            #ismart-pro-pill:hover {
                transform: scale(1.05);
                border-color: rgba(99, 102, 241, 0.7);
                box-shadow: 0 15px 35px rgba(99, 102, 241, 0.4);
            }
            .ismart-pulse-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #10b981;
                box-shadow: 0 0 10px #10b981;
                animation: ismart-glow 2s infinite;
            }
            @keyframes ismart-glow {
                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
            #ismart-pro-card {
                display: none;
                flex-direction: column;
                gap: 14px;
                width: 320px;
                background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 18px;
                padding: 18px 20px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.65);
                backdrop-filter: blur(16px);
                animation: ismart-fadein 0.25s ease-out;
            }
            @keyframes ismart-fadein {
                from { opacity: 0; transform: translateY(12px) scale(0.97); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .ismart-card-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 10px;
            }
            .ismart-card-title {
                font-weight: 800;
                font-size: 15px;
                background: linear-gradient(135deg, #38bdf8, #a855f7);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .ismart-btn-minimize {
                background: none;
                border: none;
                color: #94a3b8;
                font-size: 18px;
                cursor: pointer;
                padding: 0 4px;
                line-height: 1;
                transition: color 0.15s ease;
            }
            .ismart-btn-minimize:hover {
                color: #ffffff;
            }
            #ismart-status-box {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 12px 14px;
                font-size: 13px;
                color: #e2e8f0;
                line-height: 1.45;
                min-height: 48px;
                display: flex;
                align-items: center;
            }
            .ismart-btn-action {
                border: none;
                border-radius: 12px;
                padding: 13px 16px;
                font-weight: 700;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                color: #ffffff;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                user-select: none;
                text-decoration: none;
            }
            .ismart-btn-action:hover:not(:disabled) {
                transform: translateY(-2px);
            }
            .ismart-btn-action:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .ismart-btn-tg {
                background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
                box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
            }
            .ismart-btn-tg:hover:not(:disabled) {
                box-shadow: 0 12px 25px rgba(37, 99, 235, 0.5);
            }
            .ismart-btn-bind {
                background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
                box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
                font-size: 13px;
                padding: 10px 14px;
            }
            .ismart-btn-bind:hover:not(:disabled) {
                box-shadow: 0 12px 25px rgba(99, 102, 241, 0.5);
            }
            .ismart-footer-row {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #94a3b8;
                margin-top: 2px;
            }
            .ismart-footer-link {
                color: #38bdf8;
                text-decoration: none;
                font-weight: 500;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                transition: color 0.15s ease;
            }
            .ismart-footer-link:hover {
                color: #7dd3fc;
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
    }

    function createWidget() {
        if (document.getElementById('ismart-pro-root')) return;
        injectStyles();

        const root = document.createElement('div');
        root.id = 'ismart-pro-root';
        root.innerHTML = `
            <div id="ismart-pro-pill" title="Открыть панель iSmart PRO">
                <span class="ismart-pulse-dot"></span>
                <span>⚡ iSmart PRO</span>
            </div>
            <div id="ismart-pro-card">
                <div class="ismart-card-header">
                    <span class="ismart-card-title">⚡ iSmart PRO Bridge v3.0</span>
                    <button class="ismart-btn-minimize" id="ismart-min-btn" title="Свернуть">✕</button>
                </div>
                <div id="ismart-status-box">Готов к работе. Откройте любой тест на iSmart.</div>
                <button class="ismart-btn-action ismart-btn-tg" id="ismart-btn-tg">
                    🚀 Решить через Telegram (100%)
                </button>
                <button class="ismart-btn-action ismart-btn-bind" id="ismart-btn-bind">
                    🔗 Привязать аккаунт к боту
                </button>
                <div class="ismart-footer-row">
                    <a href="https://t.me/ismartgdz" target="_blank" class="ismart-footer-link">
                        📢 Наш Telegram-канал: @ismartgdz
                    </a>
                </div>
            </div>
        `;
        document.body.appendChild(root);

        const pill = document.getElementById('ismart-pro-pill');
        const card = document.getElementById('ismart-pro-card');
        const minBtn = document.getElementById('ismart-min-btn');
        const tgBtn = document.getElementById('ismart-btn-tg');
        const bindBtn = document.getElementById('ismart-btn-bind');

        pill.addEventListener('click', () => {
            pill.style.display = 'none';
            card.style.display = 'flex';
            updateContextStatus();
        });

        minBtn.addEventListener('click', () => {
            card.style.display = 'none';
            pill.style.display = 'flex';
        });

        tgBtn.addEventListener('click', async () => {
            if (isRequesting) return;
            await runSolveTelegram(false);
        });

        bindBtn.addEventListener('click', async () => {
            if (isRequesting) return;
            await runSolveTelegram(true);
        });

        updateContextStatus();
    }

    function setStatus(html) {
        const box = document.getElementById('ismart-status-box');
        if (box) box.innerHTML = html;
    }

    function updateContextStatus() {
        const token = sessionStorage.getItem('token');
        const path = window.location.pathname;
        const isLesson = path.includes('/educont/');
        const isFinish = path.endsWith('/finish');

        if (isFinish) {
            setStatus('🏆 <b>Тест завершен!</b><br><span style="font-size:12px;opacity:0.8;">Откройте тест заново для пересдачи на 100%.</span>');
        } else if (isLesson && token) {
            setStatus('📖 <b>Тест обнаружен!</b><br><span style="font-size:12px;opacity:0.8;">Нажмите кнопку ниже для решения через Telegram.</span>');
        } else if (token) {
            setStatus('🟢 <b>Аккаунт авторизован.</b><br><span style="font-size:12px;opacity:0.8;">Откройте нужное задание на сайте.</span>');
        } else {
            setStatus('⏳ <b>Ожидание теста...</b><br><span style="font-size:12px;opacity:0.8;">Откройте любой тест на <code>edu.ismart.org</code>.</span>');
        }
    }

    async function runSolveTelegram(isBindOnly = false) {
        const token = sessionStorage.getItem('token');
        if (!token) {
            alert('⚠️ Сначала войдите в аккаунт iSmart и откройте нужный урок!');
            return;
        }

        const lid = window.location.pathname.split('/')[2] || '';
        if (!isBindOnly && (!lid || lid.length < 8)) {
            alert('⚠️ Откройте страницу конкретного урока или теста (edu.ismart.org/educont/...)!');
            return;
        }

        isRequesting = true;
        const tgBtn = document.getElementById('ismart-btn-tg');
        const bindBtn = document.getElementById('ismart-btn-bind');
        if (tgBtn) tgBtn.disabled = true;
        if (bindBtn) bindBtn.disabled = true;

        setStatus(isBindOnly
            ? '🔄 <b>Привязываю аккаунт к боту...</b><br><span style="font-size:12px;opacity:0.8;">Генерация одноразового ключа...</span>'
            : '🔄 <b>Создаю сессию решения...</b><br><span style="font-size:12px;opacity:0.8;">Подготовка Telegram Deep Link...</span>'
        );

        const payload = JSON.stringify({
            token: token,
            lesson_id: lid,
            mode: isBindOnly ? 'bind' : 'solve'
        });

        const openTarget = (url) => {
            setStatus('🚀 <b>Сессия готова!</b><br><span style="color:#10b981;font-size:12px;">Открываю Telegram... Нажмите «Запустить» в боте.</span>');
            setTimeout(() => {
                if (typeof GM_openInTab !== 'undefined') {
                    GM_openInTab(url, { active: true });
                } else {
                    window.open(url, '_blank');
                }
                isRequesting = false;
                if (tgBtn) tgBtn.disabled = false;
                if (bindBtn) bindBtn.disabled = false;
            }, 300);
        };

        try {
            const resp = await fetch(BACKEND_URL + '/api/create_session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload
            });
            const data = await resp.json();
            if (data && data.url) {
                openTarget(data.url);
                return;
            } else if (data && data.error) {
                throw new Error(data.error);
            }
        } catch (fetchErr) {
            console.warn('[iSmart PRO] Direct fetch failed, trying GM_xmlhttpRequest...', fetchErr);
        }

        if (typeof GM_xmlhttpRequest !== 'undefined') {
            GM_xmlhttpRequest({
                method: 'POST',
                url: BACKEND_URL + '/api/create_session',
                headers: { 'Content-Type': 'application/json' },
                data: payload,
                onload: (res) => {
                    try {
                        const data = JSON.parse(res.responseText);
                        if (data && data.url) {
                            openTarget(data.url);
                        } else {
                            setStatus('❌ <b>Ошибка сервера:</b> ' + (data.error || 'неизвестно'));
                            isRequesting = false;
                            if (tgBtn) tgBtn.disabled = false;
                            if (bindBtn) bindBtn.disabled = false;
                        }
                    } catch (err) {
                        setStatus('❌ <b>Ошибка ответа сервера</b>');
                        isRequesting = false;
                        if (tgBtn) tgBtn.disabled = false;
                        if (bindBtn) bindBtn.disabled = false;
                    }
                },
                onerror: () => {
                    setStatus('❌ <b>Не удалось подключиться к серверу бота.</b>');
                    isRequesting = false;
                    if (tgBtn) tgBtn.disabled = false;
                    if (bindBtn) bindBtn.disabled = false;
                }
            });
        } else {
            setStatus('❌ <b>Не удалось связаться с сервером Telegram-бота.</b>');
            isRequesting = false;
            if (tgBtn) tgBtn.disabled = false;
            if (bindBtn) bindBtn.disabled = false;
        }
    }

    // Инициализация виджета при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }

    // Отслеживание смены роута в Next.js SPA
    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            createWidget();
            updateContextStatus();
        }
    }, 1000);

})();
