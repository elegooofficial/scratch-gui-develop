import {combineReducers} from 'redux';
import colorPickerReducer from './color-picker';
import customProceduresReducer from './custom-procedures';
import blockDragReducer from './block-drag';
import editorTabReducer from './editor-tab';
import hoveredTargetReducer from './hovered-target';
import intlReducer from './intl';
import modalReducer from './modals';
import monitorReducer from './monitors';
import monitorLayoutReducer from './monitor-layout';
import targetReducer from './targets';
import toolboxReducer from './toolbox';
import vmReducer from './vm';
import stageSizeReducer from './stage-size';
import {ScratchPaintReducer} from 'scratch-paint';

export default combineReducers({
    blockDrag: blockDragReducer,
    colorPicker: colorPickerReducer,
    customProcedures: customProceduresReducer,
    editorTab: editorTabReducer,
    hoveredTarget: hoveredTargetReducer,
    intl: intlReducer,
    stageSize: stageSizeReducer,
    modals: modalReducer,
    monitors: monitorReducer,
    monitorLayout: monitorLayoutReducer,
    targets: targetReducer,
    toolbox: toolboxReducer,
    vm: vmReducer,
    scratchPaint: ScratchPaintReducer
});
