import PropTypes from 'prop-types';
import React from 'react';
import ReactModal from 'react-modal';
import Box from '../box/box.jsx';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

import styles from './browser-modal.css';

const messages = defineMessages({
    label: {
        id: 'gui.unsupportedBrowser.label',
        defaultMessage: 'Internet Explorer is not supported',
        description: ''
    }
});

const BrowserModal = ({intl, ...props}) => (
    <ReactModal
        isOpen
        className={styles.modalContent}
        contentLabel={intl.formatMessage({...messages.label})}
        overlayClassName={styles.modalOverlay}
        onRequestClose={props.onBack}
    >
        <Box className={styles.illustration} />

        <Box className={styles.body}>
            <h2>
                <FormattedMessage {...messages.label} />
            </h2>
            <p>
                { /* eslint-disable max-len */ }
                <FormattedMessage
                    defaultMessage="We're very sorry, but Scratch 3.0 does not support Internet Explorer. We recommend trying a newer browser such as Google Chrome, Mozilla Firefox, or Microsoft Edge."
                    description="Unsupported browser description"
                    id="gui.unsupportedBrowser.description"
                />
                { /* eslint-enable max-len */ }
            </p>

            <Box className={styles.buttonRow}>
                <button
                    className={styles.backButton}
                    onClick={props.onBack}
                >
                    <FormattedMessage
                        defaultMessage="Back"
                        description="Label for button go back when browser is unsupported"
                        id="gui.unsupportedBrowser.back"
                    />
                </button>

            </Box>
            <div className={styles.faqLinkText}>
                <FormattedMessage
                    defaultMessage="To learn more, go to the {previewFaqLink}."
                    description="Scratch 3.0 FAQ description"
                    id="gui.unsupportedBrowser.previewfaq"
                    values={{
                        previewFaqLink: (
                            <a
                                className={styles.faqLink}
                                href="//scratch.mit.edu/preview-faq"
                            >
                                <FormattedMessage
                                    defaultMessage="preview FAQ"
                                    description="link to Scratch 3.0 FAQ page"
                                    id="gui.unsupportedBrowser.previewfaqlink"
                                />
                            </a>
                        )
                    }}
                />
            </div>
        </Box>
    </ReactModal>
);

BrowserModal.propTypes = {
    intl: intlShape.isRequired,
    onBack: PropTypes.func.isRequired
};

export default injectIntl(BrowserModal);
