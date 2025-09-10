<a name="readme-top"></a>

<div align="center">
    <a href="https://github.com/mshaugh/conventional-commits-action">
        <img src="https://avatars.githubusercontent.com/conventional-commits?s=80" alt="○" width="80" height="80">
    </a>
</div>

<h1 align="center">Conventional Commits Action</h1>

> A specification for adding human and machine readable meaning to commit messages.

![CI](https://img.shields.io/github/actions/workflow/status/mshaugh/conventional-commits-action/ci.yaml?branch=main&style=flat-square&label=CI)

## Usage

```yaml
name: Conventional Commits

on:
  pull_request:
    types: [ edited, opened, reopened, synchronize ]

permissions:
  pull-requests: read

jobs:
  conventional-commits:
    runs-on: ubuntu-latest
    steps:
      - name: Conventional Commits
        uses: mshaugh/conventional-commits-action@v1
        with:
          token: ${{ github.token }}
          targets: >
            title
            commits
```

## License

Licensed under either of [Apache License, Version 2.0](./LICENSE-APACHE)
or [MIT License](./LICENSE-MIT) at your option.

Unless you explicitly state otherwise, any contribution intentionally
submitted for inclusion in this work by you, as defined in the Apache-2.0
license, shall be dual licensed as above, without any additional terms or
conditions.
