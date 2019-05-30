jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000; // eslint-disable-line no-undef

import bindAll from 'lodash.bindall';
import 'chromedriver'; // register path
import webdriver from 'selenium-webdriver';

const {By, until, Button} = webdriver;

class SeleniumHelper {
    constructor () {
        bindAll(this, [
            'clickText',
            'clickButton',
            'clickXpath',
            'findByText',
            'findByXpath',
            'getDriver',
            'getLogs',
            'loadUri',
            'rightClickText'
        ]);
    }

    get scope () {
        // List of useful xpath scopes for finding elements
        return {
            blocksTab: "*[@id='react-tabs-1']",
            costumesTab: "*[@id='react-tabs-3']",
            modal: '*[@class="ReactModalPortal"]',
            reportedValue: '*[@class="blocklyDropDownContent"]',
            soundsTab: "*[@id='react-tabs-5']",
            spriteTile: '*[starts-with(@class,"react-contextmenu-wrapper")]'
        };
    }

    getDriver () {
        const chromeCapabilities = webdriver.Capabilities.chrome();
        chromeCapabilities.set('chromeOptions', {args: ['--headless']});
        this.driver = new webdriver.Builder()
            .forBrowser('chrome')
            .withCapabilities(chromeCapabilities)
            .build();
        return this.driver;
    }

    findByXpath (xpath) {
        return this.driver.wait(until.elementLocated(By.xpath(xpath), 5 * 1000));
    }

    findByText (text, scope) {
        return this.findByXpath(`//body//${scope || '*'}//*[contains(text(), '${text}')]`);
    }

    loadUri (uri) {
        const WINDOW_WIDTH = 1024;
        const WINDOW_HEIGHT = 768;
        return this.driver
            .get(`file://${uri}`)
            .then(() => (
                this.driver.executeScript('window.onbeforeunload = undefined;')
            ))
            .then(() => (
                this.driver.manage()
                    .window()
                    .setSize(WINDOW_WIDTH, WINDOW_HEIGHT)
            ));
    }

    clickXpath (xpath) {
        return this.findByXpath(xpath).then(el => el.click());
    }

    clickText (text, scope) {
        return this.findByText(text, scope).then(el => el.click());
    }

    rightClickText (text, scope) {
        return this.findByText(text, scope).then(el => this.driver.actions()
            .click(el, Button.RIGHT)
            .perform());
    }

    clickButton (text) {
        return this.clickXpath(`//button[contains(text(), '${text}')]`);
    }

    getLogs (whitelist) {
        if (!whitelist) {
            // Default whitelist
            whitelist = [
                'The play() request was interrupted by a call to pause()'
            ];
        }
        return this.driver.manage()
            .logs()
            .get('browser')
            .then(entries => entries.filter(entry => {
                const message = entry.message;
                for (let i = 0; i < whitelist.length; i++) {
                    if (message.indexOf(whitelist[i]) !== -1) {
                        // eslint-disable-next-line no-console
                        console.warn(`Ignoring whitelisted error: ${whitelist[i]}`);
                        return false;
                    } else if (entry.level !== 'SEVERE') {
                        // eslint-disable-next-line no-console
                        console.warn(`Ignoring non-SEVERE entry: ${message}`);
                        return false;
                    }
                }
                return true;
            }));
    }
}

export default SeleniumHelper;
