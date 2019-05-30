import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import Controls from '../containers/controls.jsx';
import Blocks from '../containers/blocks.jsx';
import GUI from '../containers/gui.jsx';
import ProjectLoaderHOC from '../lib/project-loader-hoc.jsx';

import styles from './blocks-only.css';

const mapStateToProps = state => ({vm: state.vm});

const VMBlocks = connect(mapStateToProps)(Blocks);
const VMControls = connect(mapStateToProps)(Controls);

const BlocksOnly = props => (
    <GUI {...props}>
        <VMBlocks
            grow={1}
            options={{
                media: `static/blocks-media/`
            }}
        />
        <VMControls className={styles.controls} />
    </GUI>
);

const App = AppStateHOC(ProjectLoaderHOC(BlocksOnly));

const appTarget = document.createElement('div');
document.body.appendChild(appTarget);

ReactDOM.render(<App />, appTarget);
