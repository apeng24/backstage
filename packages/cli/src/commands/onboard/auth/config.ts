/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { UserEntity } from '@backstage/catalog-model';
import * as fs from 'fs-extra';
import yaml from 'yaml';

type AuthConfig = {
  auth: {
    providers: {
      [key: string]: {
        development: {
          clientId: string;
          clientSecret: string;
          enterpriseInstanceUrl?: string;
          audience?: string;
        };
      };
    };
  };
};

const catalogUserLocation = {
  catalog: {
    locations: [
      {
        type: 'file',
        target: '../../user-info.yaml',
        rules: [{ allow: ['User'] }],
      },
    ],
  },
};

const readYaml = async (file: string) => {
  return yaml.parse(await fs.readFile(file, 'utf8'));
};

export const updateConfigFile = async (
  file: string,
  authConfig: AuthConfig,
) => {
  const content = fs.existsSync(file)
    ? { ...(await readYaml(file)), ...authConfig, ...catalogUserLocation }
    : { ...authConfig, ...catalogUserLocation };

  return await fs.writeFile(
    file,
    yaml.stringify(content, {
      indent: 2,
    }),
    'utf8',
  );
};

export const addUserEntity = async (
  file: string,
  username: string,
  annotations?: Record<string, string>,
) => {
  const content: UserEntity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name: username,
      annotations: { ...annotations },
    },
    spec: {
      memberOf: [],
    },
  };

  return await fs.writeFile(
    file,
    yaml.stringify(content, {
      indent: 2,
    }),
    'utf8',
  );
};
