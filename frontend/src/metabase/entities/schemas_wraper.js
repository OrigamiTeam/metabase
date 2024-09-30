import schemas from './schemas';
import { createThunkActions } from 'metabase/lib/redux';

const wrappedSchemas = {
  ...schemas,
  actions: (dispatch) => {
    const actions = schemas.actions;
    return createThunkActions(
      Object.keys(actions).reduce((acc, key) => {
        acc[key] = (...args) => (dispatch, getState) => {
          return actions[key](...args, dispatch);
        };
        return acc;
      }, {})
    );
  },
};

export default wrappedSchemas;
