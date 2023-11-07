import { querySelectorOne } from "../util.js";
import { createIframeHandler, createIframeUrl } from "./public.js";

const IFRAME_URL = 'https://stunning-telegram-96q46q665fxjpw-3001.app.github.dev/iframe.html';

interface State {
    readonly chunkSize: number;
    readonly entityData: string;
    readonly file: Maybe<File>;
    readonly orbitFileId: string;
    readonly throttle: number;
}

type Action =
    | { readonly type: 'SET_CHUNK_SIZE'; readonly payload: { readonly chunkSize: number  } }
    | { readonly type: 'SET_ENTITY_DATA'; readonly payload: { readonly entityData: string } }
    | { readonly type: 'SET_FILE'; readonly payload: { readonly file: Maybe<File> } }
    | { readonly type: 'SET_ORBIT_FILE_ID'; readonly payload: { readonly orbitFileId: string } }
    | { readonly type: 'SET_THROTTLE'; readonly payload: { readonly throttle: number  } }

const reducer: React.Reducer<State, Action> = (prevState: State, action): State => {
    const { type, payload } = action;
    switch (type) {
        case 'SET_CHUNK_SIZE':
            return {
                ...prevState,
                chunkSize: payload.chunkSize,
            };
        case 'SET_ENTITY_DATA':
            return {
                ...prevState,
                entityData: payload.entityData,
            };
        case 'SET_FILE':
            return {
                ...prevState,
                file: payload.file,
            };
        case 'SET_ORBIT_FILE_ID':
            return {
                ...prevState,
                orbitFileId: payload.orbitFileId,
            };
        case 'SET_THROTTLE':
            return {
                ...prevState,
                throttle: payload.throttle,
            };
    }
}
const initialState: State = {
    chunkSize: 524288,
    entityData: `{
    "currentLocale": "en_GB",
    "entityType": "reference",
    "externalId": "83911293",
    "masterId": 21421,
    "masterLocale": "da_DK",
    "projectEnd": "2023-09-30",
    "projectName": "Project/Reference with beautiful pictures",
    "projectStart": "2023-03-01",
    "variationId": 43132
}`,
    file: null,
    orbitFileId: 'ORBITFILE:42',
    throttle: 0,
};

interface AppProps {
    readonly iframeUrl: string;
}

const App = (props: AppProps) => {
    const { iframeUrl: iframeUrlProps } = props;
    const [state,dispatch] = React.useReducer(reducer, initialState);

    const onChange = React.useCallback((e: React.ChangeEvent<HTMLElement>) => {
        const { target } = e;
        if (target instanceof HTMLInputElement) {
            const name = target.name;
            switch (name) {
                case 'orbit-file-id':
                    return dispatch({ type: 'SET_ORBIT_FILE_ID', payload: { orbitFileId: target.value }});
                case 'file':
                    return dispatch({ type: 'SET_FILE', payload: { file: (target as HTMLInputElement).files?.item(0) ?? null }});
                case 'chunk-size':
                    return dispatch({ type: 'SET_CHUNK_SIZE', payload: { chunkSize: target.valueAsNumber }});
                case 'throttle':
                    return dispatch({ type: 'SET_THROTTLE', payload: { throttle: target.valueAsNumber }});
            }
        }
        if (target instanceof HTMLTextAreaElement) {
            const name = target.name;
            switch (name) {
                case 'entity-data':
                    return dispatch({ type: 'SET_ENTITY_DATA', payload: { entityData: target.value }});
            }
        }
    }, []);

    const iframeHandler = React.useMemo(
        () => createIframeHandler(
            state.file,
            state.orbitFileId,
            state.entityData,
            () => { dispatch({ type: 'SET_FILE', payload: { file: null }}); }, // complete
            () => { dispatch({ type: 'SET_FILE', payload: { file: null }}); }, //cancel
            state.chunkSize,
            state.throttle
        ),
        [state]
    );
    const iframeUrl = React.useMemo(() => createIframeUrl(iframeUrlProps), [iframeUrlProps]);
    const iframe = state.file == null ? null : <iframe key={state.file.name} src={iframeUrl} onLoad={iframeHandler} />;

    return(
        <React.Fragment>
            <form>
                <label>
                    <span>ORBITFILE:ID</span>
                    <input name="orbit-file-id" onChange={onChange} value={state.orbitFileId} />
                </label>
                <label>
                    <span>File</span>
                    <input name="file" onChange={onChange} type="file" />
                </label>
                <label>
                    <span>Chunk size</span>
                    <input name="chunk-size" onChange={onChange} step="100" type="range" min="500" max="1048576" value={state.chunkSize} />
                </label>
                <label>
                    <span>Throttle</span>
                    <input name="throttle" onChange={onChange} step="10" type="range" min="0" max="1000" value={state.throttle} />
                </label>
                <label>
                    <span>Entity data</span>
                    <textarea name="entity-data" onChange={onChange} value={state.entityData} />
                </label>
            </form>
            {iframe}
        </React.Fragment>
    );
};

document.addEventListener('DOMContentLoaded', () => {
    const root = querySelectorOne<HTMLDivElement>('#root', Error);
    ReactDOM.render(<App iframeUrl={IFRAME_URL} />, root);
});