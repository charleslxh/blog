---
title: GitLab-CI-持续集成
date: 2019-06-27 10:46:47
categories: [Git]
tags:
    - Git
---

本节讲述了如何配置 `.gitlab-ci.yml`，它为每个 `Runner` 的定制具体的任务。如果你想[快速入手](http://docs.gitlab.com/ce/ci/quick_start/README.html)

从 `GitLab 8.0` 开始，`GitLab CI` 就已经集成在 `GitLab` 中，我们只要在项目中添加一个 `.gitlab-ci.yml` 文件，然后添加一个 `Runner`，即可进行持续集成。 而且随着 `GitLab`的升级，`GitLab CI` 变得越来越强大，本文将介绍如何使用 `GitLab CI` 进行持续集成。

<!-- more -->

### 全局配置

从 `gitlab 7.12`，`gitlab ci` 使用 **YAML** 文件格式来作为项目的配置文件。

**.gitlab-ci.yml** 定义了每一个 `runner` 运行的状态，环境以及运行方式，每一个运行任务都必须要定义一个 `script`。

```yaml
job1_name:
  script: "execute-script-for-job1"

job2_name:
  script: "execute-script-for-job2"
```

上面是一个简单的 `job` 示例，每个 `job` 可以定义不同的执行脚本或命令。**不管是并行运行的任务，还是串行运行的任务，他们之间都是相互绝对独立的**。

**.gitlab-ci.yml** 一些保留字不能被用于作为 `Job` 的名字。

| 名字 | 是否必须 | 描述 |
|:----:|:-------:|:----:|
| [image](#image_or_services) | no | 使用 docker 镜像 |
| [services](#image_or_services) | no | 使用 docker 服务 |
| [stages](#stages) | no | 定义 build 级别 |
| [types](#types) | no | stages 的别名 |
| [before_script](#before_script) | no | 定义每个 job 执行前执行的脚本 |
| [after_script](#after_script) | no | 定义每个 job 执行后执行的脚本 |
| [variables](#variables) | no | 定义全局环境变量 |
| [cache](#cache) | no | 定义一些需要被缓存的文件 |

<span id="image_or_services"></span>
#### image or services

`image or services` 允许指定一个自定义的 docker 镜像或一系列的 docker 服务在执行 `build` 的时候，具体请[参考详情](http://docs.gitlab.com/ce/ci/docker/README.html)

#### stages

`stages` 用于定义一系列的 *build 级别*，这些 *级别* 用于 `job`中，定义的所有级别按照从前往后的顺序执行 `job`。

级别之间的运行顺序：

- 相同 *级别* 的 `job` 都并行执行。
- 下一个级别的所有 `job` 都必须在上一个级别的所有 `job` 都 `build success` 的时候才能执行。

```yaml
stages:
    - build
    - test
    - deploy
```

不同级别的 `job` 运行示例:

![stages](/uploads/images/posts/git/gitlab-ci/stages.png)

运行步骤：

1. 所有的 `build` 级别的 *job* 都并行执行。
2. 当所有的 `build job` 都执行 **成功** 后，所有的 `test` 级别的 *job* 开始并行执行。
3. 当所有的 `test job` 都执行 **成功** 后，所有的 `deploy` 级别的 *job* 开始并行执行。
4. 当所有的 `deploy job` 都执行 **成功** 后，这个 `commit` 被标记为 *passed*。
5. 如果其中任何一个 *job* 执行失败，这个 `commit` 被标记为 *failed*，并且跳出执行，以后的所有 `stage` 的 *job* 都不会在执行。

**PS**:

- 假如 *.gitlab-ci.yml* 没有定义 *stages*，则默认顺序为 `build` -> `test` -> `deploy`
- 假如 *job* 没有定义 *stage*，则默认该任务的 `stage` 为 'test'

#### types

[stages](#stages) 的别名。

#### before_script

`before_script` 定义了一系列命令，他们将会在每一个 `job` 之前运行，他可以是一个数组，也可以是一个多行的字符串。

#### after_script

`before_script` 定义了一系列命令，他们将会在每一个 `job` 运行完成后执行，他可以是一个数组，也可以是一个多行的字符串。

#### variables

**Gitlab CI** 允许你定一些变量，他们将会被复制到当前进程的环境变量中。他们能在之后运行的 **脚本** 或 **命令行** 中引用，[预先定义的变量](http://docs.gitlab.com/ce/ci/variables/README.html)。

```yaml
variables:
  DATABASE_URL: "postgres://postgres@postgres/my_database"
  REDIS_URL: "unix:/etc/redis/sockets/redis.socket"
  NODE_ENV: "production"
```

**PS**: 如果定义了 *Job* 级别的环境变量的话，该 *Job* 会优先使用 *Job* 级别的环境变量。

#### cache

定义需要缓存的文件。每个 *Job* 开始的时候，`Runner` 都会删掉 `.gitignore` 里面的文件。如果有些文件 (如 `node_modules/` ) 需要多个 *Jobs* 共用的话，我们只能让每个 *Job* 都先执行一遍 `npm install`。

这样很不方便，因此我们需要对这些文件进行缓存。缓存了的文件除了可以跨 *Jobs* 使用外，还可以跨 `Pipeline` 使用。

具体用法请查看[官方文档](http://docs.gitlab.com/ce/ci/yaml/README.html#cache)。

**PS**：
- 默认 *cache* 在每一个 *job* 和 *branch* 是开启的。
- 如果定义 *全局的 cache*，他表示每一个 *job* 都会使用该 *cache*

以下为具体示例：

1. 缓存 `binaries` 目录和 `.config` 文件。

    ```yaml
    job1:
      script: test
      cache:
        paths:
          - binaries/
          - .config
    ```

2. 缓存所有未跟踪（untracked）的文件。
    
    ```yaml
    job2:
      script: test
      cache:
        untracked: true
    ```

3. 缓存所有未跟踪（untracked）的文件和 `binaries` 目录。
    
    ```yaml
    job2:
      script: test
      cache:
        untracked: true
        paths:
                - binaries/
    ```

4. *job* 级别的 `cache` 会重写 `全局 cahce`，下面示例只会缓存 `binaries` 目录。

    ```yaml
    cache:
      paths:
        - my/files

    job1:
      script: test
      cache:
        paths:
          - binaries/
    ```

##### cache:key

*key* 字段允许你自由的定义 `cache` 的方式，是每个 *job* 都有一次缓存，还是 *所有 jobs * 只有一次 `cache`；它允许你在不同的 *job* 之间缓存数据；也允许你在不同的 *branch* 之间缓存数据。

1. To enable per-job caching:

    ```yaml
    cache:
      key: "$CI_BUILD_NAME"
      untracked: true
    ```

2. To enable per-branch caching:
 
    ```yaml
    cache:
      key: "$CI_BUILD_REF_NAME"
      untracked: true
    ```

3. To enable per-job and per-branch caching:
 
    ```yaml
    cache:
      key: "$CI_BUILD_NAME/$CI_BUILD_REF_NAME"
      untracked: true
    ```

4. To enable per-branch and per-stage caching:
 
    ```yaml
    cache:
      key: "$CI_BUILD_STAGE/$CI_BUILD_REF_NAME"
      untracked: true
    ```

5. If you use Windows Batch to run your shell scripts you need to replace $ with %:
 
    ```yaml
    cache:
      key: "%CI_BUILD_STAGE%/%CI_BUILD_REF_NAME%"
      untracked: true
    ```

### Job 配置

`.gitlab-ci.yml` 允许你无限制的定义 *job*，每个 *job* 都必须要有一个 **唯一** 的名字，但不能是上面所提到的关键字，同时还提供了一些参数来制定你的 *job* 行为。

```yaml
job_name:
  script:
    - rake spec
    - coverage
  stage: test
  only:
    - master
  except:
    - develop
  tags:
    - ruby
    - postgres
  allow_failure: true
```

| 参数名 | 是否必须 | 描述 |
|:----:|:-------:|:----:|
| [script](#script) | Required | 需要运行的脚本或命令 |
| [image](#job_image_or_services) | no | 使用 *docker* 镜像 |
| [services](#job_image_or_services) | no | 使用 *docker* 服务 |
| [stage](#stage) | no | 定义 *build* 级别，默认 *test* |
| [type](#type) | no | *stage* 的别名 |
| [variables](#job_variables) | no | 定义 *job* 级别的环境变量 |
| [only](#job_only_or_except) | no | 指定 *job* 哪些 *branch* 或 *tags* 是可以执行的 |
| [except](#job_only_or_except) | no | 指定 *job* 哪些 *branch* 或 *tags* 是可以不可用执行的 |
| [tags](#tags) | no | 指定执行 *job* 的 `runner` |
| [allow_failure](#allow_failure) | no | 指定 *job* 允许失败 |
| [when](#when) | no | 定义任务执行时间 |
| [artifacts](#artifacts) | no | 指定需要上传到 `Gitlab` 的文件 |
| [dependencies](#dependencies) | no | 定义需要下载的 `artifacts` |
| [cache](#job_cache) | no | 定义一些需要被缓存的文件 |
| [before_script](#job_before_script) | no | 指定 *job* 执行前运行的脚本或命令 |
| [after_script](#job_after_script) | no | 指定 *job* 执行完成后运行的脚本或命令 |
| [environment](#environment) | no | 定义发布到指定的 environment 中 |

#### script

`Runner` 运行的所需的脚本，他可以是 **字符串** 或 **数组**，如下：

如果只运行一条命令时，可以选择字符串：

```yaml
script: "npm run build"
```

如果要运行多行命令，可以选择数组：

```yaml
script:
  - uname -a
  - npm install
  - npm run build
```

<span id="job_image_or_services"></span>
#### image or services

`image or services` 允许指定一个自定义的 docker 镜像或一系列的 docker 服务在执行 `build` 的时候，具体请[参考详情](http://docs.gitlab.com/ce/ci/docker/README.html)。

**PS**：如果该值存在，在这个 *job* 中使用该值，否则使用全局定义的 **image & services**

#### stage

指定当前 *job* 的级别，相同级别的 *job* 是并行执行的，详情参考 [stages](#stages)。

#### type

[stage](#stage) 的别名。

<span id="job_variables"></span>
#### variables

*job 级别* 的变量，一旦定义了 *job 级别* 的变量，它所定义的变量将优先于 [YAML 中定义的全局变量](#variables) 和 [预定义变量](http://docs.gitlab.com/ce/ci/variables/README.html)。

变量的优先级[参考这里](http://docs.gitlab.com/ce/ci/variables/README.html)

<span id="job_only_or_except"></span>
#### only or except

*only* 或 *except* 参数可以指定一套规则来限制 *job* 是否需要执行。

- 可以通过配置 *only* 来指定哪些 *branch* 或 *tag* 是 **需要** 执行 *job*。
- 可以通过配置 *only* 来指定哪些 *branch* 或 *tag* 是 **不需要** 执行 *job*。

参数规则：

- *only* 和 *except* 会同时生效，如果同时指定了 *only* 和 *except*，他们都会生效。
- *only* 和 *except* 都支持正则表达式。
- *only* 和 *except* 都可以使用特殊关键字：`branches`、`tags` 和 `triggers` 。
- *only* 和 *except* 可以根据仓库地址来过滤，一般用户 `fork` 工作流。

示例：

1. `only` 规定了所有符合 `/^issue\-.*$/` 的 *branch* 或 *tag* 都可以执行，*except* 规定了所有的 *branch* 都不执行，所以最终只执行了 **所有符合正则表达式的 tag**。

```yaml
job:
  # use regexp
  only:
    - /^issue-.*$/
  # use special keyword
  except:
    - branches
```

2. 只有 *tags* 和 *triggers* 执行。

```yaml
job:
  # use special keywords
  only:
    - tags
    - triggers
```

3. *job* 只执行父仓库，不执行 `fork` 的仓库，即：只执行 `gitlab-org/gitlab-ce` 上的 *branches* 且不执行 `master` 分支。

```yaml
job:
  only:
    - branches@gitlab-org/gitlab-ce
  except:
    - master@gitlab-org/gitlab-ce
```

#### tags

*tags* 用来指定特殊的 `Runner` 来运行这个 *job*。

*tags* 的过滤方式是通过 **runner** 在注册的时候会指定该 *runner* 的 `tag`。

示例：下面是一个 *tag* 为 `shell` 的 **runner**。

![job_tags](https://rs.daniujia.com/chatserver/images/docs/git/ci/job_tags.png)

我们某一个 **job** 指定一个 *runner* 来运行这个 *job*。

```yaml
job:
  tags:
    - shell
```

#### allow_failure

当 *job* 运行失败或出现警告的时候，则依然认为该 *job* 是 **成功** 的，但是这个 `build` 详情里面能够看到相关的错误信息与警告信息。

#### when

该参数指定 *job* 执行的条件，参数值可以取：

- `on_success`：只有之前的所有 *job* 都执行成功了，才执行这个 *job*，**默认**。
- `on_failure`：只要之前的所有 *job* 中有一个执行失败了，就执行这个 *job*。
- `always`：不管之前的所有 *job* 执行状态是什么，都执行这个 *job*。
- `manual`：手动执行，请参考 [manual actions](http://docs.gitlab.com/ce/ci/yaml/README.html#manual-actions)。

```yaml
stages:
  - build
  - cleanup_build
  - test
  - deploy
  - cleanup

build_job:
  stage: build
  script:
    - make build

cleanup_build_job:
  stage: cleanup_build
  script:
    - cleanup build when failed
  when: on_failure

test_job:
  stage: test
  script:
    - make test

deploy_job:
  stage: deploy
  script:
    - make deploy
  when: manual

cleanup_job:
  stage: cleanup
  script:
    - cleanup after builds
  when: always
```

上面的执行情况为：
- 当 `build_job` 执行失败，就会执行 `cleanup_build_job`，否则不执行。
- 无论如何 `cleanup_job` 都会作为最后一个 *job* 执行。
- 允许你从 **Gitlab UI** 中手动执行 `deploy_job`。

**PS**: `manual` 是一种特殊的类型，他类型阻止 *job* 自动运行，需要用户手动点击执行。

#### artifacts

定义 `Job` 中生成的附件。当该 `Job` 运行成功后，生成的文件可以作为附件 (如生成的二进制文件) 保留下来，打包发送到 `GitLab`，之后我们可以在 `GitLab` 的项目页面下下载该附件。

**注意**：不要把 `artifacts` 和 `cache` 混淆了。

下面是一些具体示例：

1. 发送所有位于 `binaries` 目录下的文件和 `.config` 文件。

    ```yaml
    artifacts:
      paths:
        - binaries/
        - .config
    ```

2. 发送所有 **未跟踪** 的文件。

    ```yaml
    artifacts:
      untracked: true
    ```

3. 发送所有位于 `binaries` 目录下的 **未跟踪** 文件。

    ```yaml
    artifacts:
      untracked: true
      paths:
        - binaries/
    ```

4. 当 `tag` 的时候，发送所有 `binaries` 目录下的文件。

    ```yaml
    release-job:
      script:
        - mvn package -U
      artifacts:
        paths:
          - target/*.war
      only:
        - tags
    ```

5. 发送所有 `binaries` 目录下的文件，并指定发送文件的名字。

    ```yaml
    job:
      artifacts:
        # 指定 name：job_name.current_branch_or_tag_name
        name: "${CI_BUILD_NAME}.${CI_BUILD_REF_NAME}"
        untracked: true
    ```

6. 指定发送文件的条件。

    ```yaml
    job:
      artifacts:
        when: on_failure
    ```

**when** 的取值有：
- `on_success`：当 *job* 执行成功，就发送文件。
- `on_failure`：当 *job* 执行失败，就发送文件。
- `always`：无论 *job* 执行成功或者失败，都发送文件。

7. 指定发送文件的 **生存期**。

**expire_in** 是指该文件能够保存的时长，比如：
- '3 mins 4 sec'
- '2 hrs 20 min'
- '2h20min'
- '6 mos 1 day'
- '47 yrs 6 mos and 4d'
- '3 weeks and 2 days'

    ```yaml
    job:
      artifacts:
        expire_in: 1 week
    ```


#### dependencies

该参数用于与[artifacts](#artifacts)结合使用，允许你指定不同 *job* 之间 *artifacts*，的传输。

**PS**：默认后面的 *job* 将会下载前面所有 *job* 所上传的文件。

通过这个参数，能够有效的为每一个 *job* 定义他所需要下载的 *artifacts*，该参数的值 **必须** 为前面所定义好的 *job* 的名字（`按照 stages 定义的顺序来判断`），如果 `dependencies` 的值，在 `stages` 定义的顺序中，如果 *job* 的 `dependencies` 的值指向了一个前面没有定义过的 *job* 的名字则将会抛出错误。`dependencies` 指定 **空数组**则不会下载任何前面上传的 *artifacts*。

示例：

```yaml
build:osx:
  stage: build
  script: make build:osx
  artifacts:
    paths:
      - binaries/

build:linux:
  stage: build
  script: make build:linux
  artifacts:
    paths:
      - binaries/

test:osx:
  stage: test
  script: make test:osx
  dependencies:
    - build:osx

test:linux:
  stage: test
  script: make test:linux
  dependencies:
    - build:linux

deploy:
  stage: deploy
  script: make deploy
```

在该示例中：
- `test:osx` 在 `script` 执行前下载 `build:osx` 上传的 *artifacts*。
- `test:linux` 在 `script` 执行前下载 `build:linux` 上传的 *artifacts*。
- `deploy` 在 `script` 执行前下载 `build:osx` 和 `build:linux` 上传的 *artifacts*。

<span id="job_cache"></span>
#### cache

该参数在当前 *job* 中将会重写 [全局的 cache](#cache)。

<span id="job_before_script"></span>
#### before_script

该参数在当前 *job* 中将会重写 [全局的 before_script](#before_script)。

<span id="job_after_script"></span>
#### after_script

该参数在当前 *job* 中将会重写 [全局的 after_script](#after_script)。

#### environment

该值用来指定发布（deploy）的时候指定到一个特殊的 `environment` 中，这个将会非常有利于在 `Gitlab` 中追踪整个发布过程。

**PS**：*environment* 的值只能包含 **字母**、**数字**、**-** 和 **_** 组成。

```yaml
deploy_to_production:
  stage: deploy
  script: git push production HEAD:master
  environment: production
```

### 示例

```yaml
stages:
  - install_deps
  - test
  - build
  - deploy_test
  - deploy_production

cache:
  key: ${CI_BUILD_REF_NAME}
  paths:
    - node_modules/
    - dist/


# 安装依赖
install_deps:
  stage: install_deps
  only:
    - develop
    - master
  script:
    - npm install


# 运行测试用例
test:
  stage: test
  only:
    - develop
    - master
  script:
    - npm run test


# 编译
build:
  stage: build
  only:
    - develop
    - master
  script:
    - npm run clean
    - npm run build:client
    - npm run build:server


# 部署测试服务器
deploy_test:
  stage: deploy_test
  only:
    - develop
  script:
    - pm2 delete app || true
    - pm2 start app.js --name app


# 部署生产服务器
deploy_production:
  stage: deploy_production
  only:
    - master
  script:
    - bash scripts/deploy/deploy.sh
```

上面的配置把一次 Pipeline 分成五个阶段：
1. 安装依赖(`install_deps`)
2. 运行测试(`test`)
3. 编译(`build`)
4. 部署测试服务器(`deploy_test`)
5. 部署生产服务器(`deploy_production`)

设置 `Job.only` 后，只有当 `develop` 分支和 `master` 分支有提交的时候才会触发相关的 `Jobs`。
注意，我这里用 **GitLab Runner** 所在的服务器作为测试服务器。

