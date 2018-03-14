import {createWall} from "./plain-wall";
import {createApp} from "./index";
import {Msg} from "./messages.types";
const nodes = require('../fixtures/large.json');

const {incoming$, outgoing$} = createWall();
const app = createApp({incoming$, outgoing$});

const msg: Msg.ParsedComments = {
    type: Msg.Names.ParsedComments,
    payload: nodes
};

incoming$.next(msg);
