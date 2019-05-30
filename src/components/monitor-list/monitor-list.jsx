import React from 'react';
import Box from '../box/box.jsx';
import Monitor from '../../containers/monitor.jsx';
import PropTypes from 'prop-types';
import {OrderedMap} from 'immutable';


import styles from './monitor-list.css';

const MonitorList = props => (
    <Box
        className={styles.monitorList}
    >
        {props.monitors.valueSeq().map(monitorData => (
            <Monitor
                id={monitorData.id}
                key={monitorData.id}
                opcode={monitorData.opcode}
                params={monitorData.params}
                spriteName={monitorData.spriteName}
                value={monitorData.value}
                onDragEnd={props.onMonitorChange}
            />
        ))}
    </Box>
);

MonitorList.propTypes = {
    monitors: PropTypes.instanceOf(OrderedMap),
    onMonitorChange: PropTypes.func.isRequired
};

export default MonitorList;
