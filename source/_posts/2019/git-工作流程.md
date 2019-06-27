---
title: Git 工作流程
date: 2019-06-26 10:45:37
categories: [Git]
tags:
    - Git
---

有一套 **规范**、**严谨** 的开发流程是一个团队提高工作效率，减少工作冲突的重要途径，以下使我们公司目前使用的开发流程，请大家 **务必严格** 遵循该流程。

<!-- more -->

## 流程说明

![git-flow](/uploads/images/posts/git/git-flow/git-flow.png)

## 分支概述

从上图，我们可以大概清楚整个开发流程，大概了解各个开发分支的作用与关系，下面我们将详细概述他们。

`Git` 分支一般分为两种：**长期支持分支**，**短期支持分支**。*长期支持* 的分支是受保护的，长期维护、迭代和更新的，是不能被删除的；*短期支持* 分支一般是用于实现某个新功能、修复长期支持分支上的问题而产生的，他们都是基于长期分支的小分支，在它们的使命完成后都需要被删除。

长期支持的分支有：

- `master`：主分支，负责记录上线版本的迭代，该分支代码与线上代码是完全一致的。
- `develop`：开发分支，该分支记录相对稳定的版本，所有的 `feature` 分支和 `bugfix` 分支都从该分支创建。

短期支持分支有：

- `feature/*`：特性（功能）分支，用于开发新的功能，不同的功能创建不同的功能分支，功能分支开发完成并自测通过之后，需要合并到 `develop` 分支，之后删除该分支。
- `bugfix/*`：`bug` 修复分支，用于修复不紧急的 `bug`，普通 `bug` 均需要创建 `bugfix` 分支开发，开发完成自测没问题后合并到 `develop` 分支后，删除该分支。
- `release/*`：发布分支，用于代码上线准备，该分支从 `develop` 分支创建，创建之后由测试同学发布到测试环境进行测试，测试过程中发现 `bug` 需要开发人员在该release分支上进行bug修复，所有bug修复完后，在上线之前，需要合并该 `release` 分支到 `master` 分支和 `develop` 分支。
- `hotfix/*`：紧急 `bug` 修复分支，该分支只有在紧急情况下使用，从 `master` 分支创建，用于紧急修复线上 `bug`，修复完成后，需要合并该分支到 `master` 分支以便上线，同时需要再合并到 `develop` 分支。

### 长期支持分支

![git-flow](/uploads/images/posts/git/git-flow/main-branches@2x.png)

#### master

**一切源于 `master`**。

一个丰富、复杂的代码仓库都是以 `master` 分支开始的，相信 `git` 用户都会非常了解这个分支，没错它就是我们的主分支，他的代码与线上的代码一模一样（这点，每个项目管理员都必须保证），所以他是稳定的、干净的、经过严格测试过的。

#### develop

`develop` 一开始是从 `master` 切出来复制版，它永远跑在 `master` 的前面，它包含了一切未来即将上线的功能。

所有 **新功能** 都是基于 `develop` 分支做开发，当然，部分小的修改可以直接在这个分支上提交代码，但提交者必须明确自己在做什么，必须对自己严谨，一般不推荐。

### 短期支持分支

在主分支（长期支持分支）之后，我们使用了大量的短期分支，通过这些短期分支来协助开发，充分的利用 `git` 分支的特性，使每个分支的功能更加 *明确* 与 *简单* ，不同于长期分支，这些分支都有一个较短的生命周期。

任何短期分支都有一个明确的目的，并且必须遵守严格的规则。

> 我们都必须遵循：所有的短期分支功能必须做到单一、明确，而不应该出现过于复杂的业务逻辑，更不应该跨业务。

#### Feature

`Feature` 分支用于开发新功能，俗称 **功能分支**，该分支完成后将会合并入 `develop` 分支，并删除。

该分支 **必须** 基于 `develop` ，分支功能完成后 **必须** 合并到 `develop`。

**命名规范：除了 `master`、`develop`、`release-*`、`bugfix-*` 或 `hotfix-*` 之外的任何东西，最好名字能概括分支的功能，但不宜过长。**

![git-flow](/uploads/images/posts/git/git-flow/fb@2x.png)

##### 示例

1. 创建一个新功能分支。

  ```shell
  $ git checkout -t origin/develop -b myfeature
  # Switched to a new branch "myfeature"
  ```

2. 提交更新。

  ```shell
  $ git add -A
  $ git commit -m 'Your commit message here.'
  $ git fetch
  $ git pull --rebase
  $ git push origin myfeature -f
  ```

  **注意**：
    - 一个分支一条 `commit`，如果后续有更新，请使用 `git commit --amend` 提交更改。
    - `push` 代码前 **必须** 拉取远程最新代码，以防止其他人与产生冲突。

3. 功能完成，将该分支合并到 `develop` 分支。

  ```bash
  $ git checkout develop
  # Switched to branch 'develop'
  $ git merge --no-ff myfeature
  # Updating ea1b82a..05e9557
  # (Summary of changes)
  $ git branch -d myfeature
  # Deleted branch myfeature (was 05e9557).
  $ git push origin develop
  ```
  
  ` --no-ff` 选项为强制关闭 `Fast-Forward` 模式，即每次合并都会产生一个 `commit`，需要用户指定 `message` 内容，该操作可以避免丢失部分信息。

  `fast-forward` 方式就是当条件允许的时候，`git` 直接把 `HEAD` 指针指向合并分支的头，完成合并。属于 **快进方式**，不过这种情况如果删除分支，则会丢失分支信息。因为在这个过程中没有创建 `commit`。
  
  ![git-flow](/uploads/images/posts/git/git-flow/merge-without-ff@2x.png)

4. 功能分支完成使命，删除。

  ```bash
  $ git branch -D myfeature
  # Deleted branch myfeature (was ff452fe).
  $ git push origin :myfeature
  # To git@git.domain.com:group/project_name.git
  #   - [deleted]         myfeature
  ```

#### Release

`Release` 分支用于准备即将上线的内容，此外，该分支可以对 **版本号**、**构建日期** 进行更改。通过 **发布分支** 来完成这些事情，`develop` 分支就继续接受下一次需要发布的功能、`Bug` 修复等等，从而不需要等待 `master` 发布完成后。

该分支 **必须** 基于 `develop` ，分支功能完成后 **必须** 合并到 `develop` 和 `master`。

**命名规范：`release-*`**。

##### 示例

例如：目前正式环境的版本为 `1.1.5`，而此时有两个功能分支 `feature/A` 和 `feature/B`，其中 `feature/A` 是本次需要部署到正式环境的内容，版本号为 `1.2.0`。而 `feature/B` 是准备在 `1.3.0` 中发布的新功能。所以，我们需要先将 `feature/A` 合并到 `develop` 分支，然后基于当前 `develop` 分支中创建一个 `release-1.2` 分支，这样 `develop` 就被释放了，他可以继续接受其他的新功能了，等待下一次发布。

1. 创建发布分支。

  发布分支是从 `develop` 分支创建的，创建的时候 **务必** 确保当前 `develop` 的所有功能都是本次上线的功能，并且是经过测试的，下一次上线的功能需要在发布分支创建之后再合并入 `develop`。

  ```bash
  $ git checkout -t origin/develop -b release-1.2.0
  # Switched to a new branch "release-1.2.0"
  ```

2. 更新元信息：版本好、构建时间等等。

  ```bash
  $ ./bump-version.sh 1.2.0
  # Files modified successfully, version bumped to 1.2.0.
  $ git commit -a -m "Bumped version number to 1.2.0"
  # [release-1.2.0 74d9424] Bumped version number to 1.2.0
  #   1 files changed, 1 insertions(+), 1 deletions(-)
  ```

3. 合并到 `master`。

  ```bash
  $ git checkout master
  # Switched to branch 'master'
  $ git merge --no-ff release-1.2.0
  # Merge made by recursive.
  # (Summary of changes)
  $ git push origin master
  $ git tag -a 1.2.0
  $ git push origin 1.2.0
  ```

4. 合并到 `develop`。

  ```bash
  $ git checkout develop
  # Switched to branch 'develop'
  $ git merge --no-ff release-1.2.0
  # Merge made by recursive.
  # (Summary of changes)
  ```

5. 删除发布分支。

  ```bash
  $ git branch -D release-1.2.0
  # Deleted branch release-1.2.0 (was ff452fe).
  ```

#### Hotfix

`Hotfix` 分支跟 `Release` 分支差不多，都是为了准备下一次上线内容，不过他用于处理 **紧急的** 的线上环境的 `Bug`，`Hotfix` 分支必须从 `master` 分支创建。

`Hotfix` 分支的本质作用为：当一个人紧急修复正式环境某个 `Bug` 时不会影响其他开发人员（`develop` 分支）的工作进度。

该分支 **必须** 基于 `master` ，分支功能完成后 **必须** 合并到 `develop` 和 `master` 。

**命名规范：`hotfix-*`**。

![git-flow](/uploads/images/posts/git/git-flow/hotfix-branches@2x.png)

##### 示例

例如：目前正式环境的版本为 `1.2.0`，但是，发现线上有一些 `Bug`，需要紧急修复，但是 `develop` 分支上的新功能还不稳定，不能发布，所以我们需要使用 `hotfix` 分支来修复线上 `Bug`。

1. 创建 `hotfix` 分支。

  ```bash
  $ git checkout -t origin/master -b hotfix-1.2.1
  Switched to a new branch "hotfix-1.2.1"
  ```

2. 修复 `Bug` 之后，提交更改。

  ```bash
  $ git commit -m "Fixed severe production problem"
  # [hotfix-1.2.1 abbe5d6] Fixed severe production problem
  #   5 files changed, 32 insertions(+), 17 deletions(-)
  ```

3. 提升版本号，然后提交。

  ```bash
  $ ./bump-version.sh 1.2.1
  # Files modified successfully, version bumped to 1.2.1.
  $ git commit -a -m "Bumped version number to 1.2.1"
  # [hotfix-1.2.1 41e61bb] Bumped version number to 1.2.1
  #   1 files changed, 1 insertions(+), 1 deletions(-)
  ```

4. 合并到 `master`。
  
  将修复过的程序发布到正式环境。

  ```bash
  $ git checkout master
  # Switched to branch 'master'
  $ git merge --no-ff hotfix-1.2.1
  # Merge made by recursive.
  # (Summary of changes)
  $ git push origin master
  $ git tag -a 1.2.1
  $ git push origin 1.2.1
  ```

5. 合并到 `develop`。
  
  为了确保下一次发布包含该修复的问题，我们需要将该 `hotfix` 分支合并入 `develop` 分支。

  ```bash
  $ git checkout develop
  # Switched to branch 'develop'
  $ git merge --no-ff hotfix-1.2.1
  # Merge made by recursive.
  # (Summary of changes)
  ```
  
  **注意**：如果有 `未发布` 的 **发布分支** 存在，则需要将该 `hotfix` 分支合并入 **发布分支**，而不是 `develop` 分支，因为最终发布分支也会被合并到 `develop` 分支，如果 `develop` 非常紧急的需要使用 `hotfix` 上修复的内容，也可以合并到 `develop` 分支，这都不会有影响。

6. 删除该分支。
  
  该功能分支使命结束后，删除它。

  ```bash
  $ git branch -d hotfix-1.2.1
  # Deleted branch hotfix-1.2.1 (was abbe5d6).
  ```

### 版本标记

同大多数 `VCS` 一样，`Git` 也可以对某一时间点上的版本打上标签。人们在发布某个软件版本（比如 `v1.0` 等等）的时候，经常这么做。

`Git` 使用的标签有两种类型：

  - 轻量级的（lightweight）：轻量级标签就像是个不会变化的分支，实际上它就是个指向特定提交对象的引用。
  - 含附注的（annotated）：含附注标签，实际上是存储在仓库中的一个独立对象，它有自身的校验和信息，包含着标签的名字，电子邮件地址和日期，以及标签说明，标签本身也允许使用 `GNU Privacy Guard (GPG)` 来签署或验证。一般我们都建议使用含附注型的标签，以便保留相关信息；

当然，如果只是临时性加注标签，或者不需要旁注额外信息，用 *轻量级标签* 也没问题。

[详情查看 - 如何打标签？](https://git-scm.com/book/zh/v1/Git-%E5%9F%BA%E7%A1%80-%E6%89%93%E6%A0%87%E7%AD%BE)

## 使用 git flow 简化操作

`git flow` 是 `git` 的一个插件，可以极大程度的简化执行 `git` 标准分支流程的操作，可以在 [gitflow-avh](https://github.com/petervanderdoes/gitflow-avh) 安装。

详情参考： [Git 相关工具介绍 - Git flow](/docs/knowledges/git/tools#git-flow)。

## 特别鸣谢

- [A successful Git branching model](http://nvie.com/posts/a-successful-git-branching-model/) - [Vincent Driessen](http://nvie.com/about/)
- [研发团队GIT开发流程新人学习指南](https://github.com/mylxsw/growing-up/blob/master/doc/%E7%A0%94%E5%8F%91%E5%9B%A2%E9%98%9FGIT%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E6%96%B0%E4%BA%BA%E5%AD%A6%E4%B9%A0%E6%8C%87%E5%8D%97.md) - [管宜尧](https://github.com/mylxsw)
- [Git 分支 - 利用分支进行开发的工作流程](https://git-scm.com/book/zh/v1/Git-%E5%88%86%E6%94%AF-%E5%88%A9%E7%94%A8%E5%88%86%E6%94%AF%E8%BF%9B%E8%A1%8C%E5%BC%80%E5%8F%91%E7%9A%84%E5%B7%A5%E4%BD%9C%E6%B5%81%E7%A8%8B)
- [Git分支管理策略](http://www.ruanyifeng.com/blog/2012/07/git.html) - [阮一峰](http://www.ruanyifeng.com/)
