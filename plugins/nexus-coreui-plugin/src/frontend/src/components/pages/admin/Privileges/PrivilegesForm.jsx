/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
import React from 'react';
import {useService} from '@xstate/react';

import {
  FormUtils,
  ValidationUtils,
  ExtJS,
  FormFieldsFactory,
} from '@sonatype/nexus-ui-plugin';
import {
  NxForm,
  NxFormGroup,
  NxButton,
  NxFontAwesomeIcon,
  NxH2,
  NxTextInput,
  NxFormSelect,
  NxTile,
} from '@sonatype/react-shared-components';

import {faTrash} from '@fortawesome/free-solid-svg-icons';

import UIStrings from '../../../../constants/UIStrings';

const {PRIVILEGES: {FORM: LABELS}} = UIStrings;

export default function PrivilegesForm({itemId, service, onDone}) {
  const [current, send] = useService(service);

  const {
    data: {type, readOnly},
    types = {},
    loadError,
    saveError,
    isPristine,
    validationErrors,
  } = current.context;

  const isLoading = current.matches('loading');
  const isSaving = current.matches('saving');
  const isInvalid = ValidationUtils.isInvalid(validationErrors);
  const isCreate = ValidationUtils.isBlank(itemId);
  const isEdit = !isCreate;
  const hasDeletePermissions = ExtJS.checkPermission('nexus:privileges:delete');
  const canDelete = hasDeletePermissions && !readOnly;
  const isTypeSelected = Boolean(type);
  const fields = types[type]?.formFields || [];

  const save = () => send('SAVE');

  const cancel = () => onDone();

  const confirmDelete = () => send('CONFIRM_DELETE');

  const retry = () => send('RETRY');

  const setType = event => send({type: 'SET_TYPE', privilegeType: event.target.value});

  const onChangeField = (name, value) => send({type: 'UPDATE', data: {[name]: value}});

  return <NxForm
      loading={isLoading}
      loadError={loadError}
      onCancel={cancel}
      doLoad={retry}
      onSubmit={save}
      submitError={saveError}
      submitMaskState={isSaving ? false : null}
      submitBtnText={UIStrings.SETTINGS.SAVE_BUTTON_LABEL}
      submitMaskMessage={UIStrings.SAVING}
      validationErrors={FormUtils.saveTooltip({isPristine, isInvalid})}
      additionalFooterBtns={isEdit && canDelete &&
          <NxButton variant="tertiary" onClick={confirmDelete}>
            <NxFontAwesomeIcon icon={faTrash}/>
            <span>{UIStrings.SETTINGS.DELETE_BUTTON_LABEL}</span>
          </NxButton>
      }
  >
    <NxTile.Content>
      <NxH2>{LABELS.SECTIONS.SETUP}</NxH2>
      <NxFormGroup label={LABELS.TYPE.LABEL} isRequired>
        <NxFormSelect
            {...FormUtils.selectProps('type', current)}
            value={type}
            disabled={isEdit}
            onChange={setType}
        >
          <option disabled={isTypeSelected} value=""/>
          {Object.values(types)?.map(({id, name}) => <option key={id} value={id}>{name}</option>)}
        </NxFormSelect>
      </NxFormGroup>
      <NxFormGroup label={LABELS.NAME.LABEL} isRequired>
        <NxTextInput
            className="nx-text-input--long"
            {...FormUtils.fieldProps('name', current)}
            onChange={FormUtils.handleUpdate('name', send)}
            disabled={isEdit}
        />
      </NxFormGroup>
      <NxFormGroup label={LABELS.DESCRIPTION.LABEL}>
        <NxTextInput
            className="nx-text-input--long"
            {...FormUtils.fieldProps('description', current)}
            onChange={FormUtils.handleUpdate('description', send)}
        />
      </NxFormGroup>

      {type && <>
        {FormFieldsFactory.getFields(fields)?.map(({Field, props}) => (
            <NxFormGroup
                key={props.id}
                label={props.label}
                sublabel={props.helpText}
                isRequired={props.required}
            >
              <Field
                  id={props.id}
                  dynamicProps={props}
                  current={current}
                  onChange={onChangeField}
              />
            </NxFormGroup>
        ))}
      </>}
    </NxTile.Content>
  </NxForm>;
}
