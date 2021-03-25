# Prerequisites
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [helm](https://helm.sh/docs/intro/install/)
- [fluxctl](https://docs.fluxcd.io/en/1.18.0/references/fluxctl.html)
- [k3d	(Optional)](https://github.com/rancher/k3d#get)
- [Kustomize](https://kubernetes-sigs.github.io/kustomize/installation/)


brew upgrade
brew install kind
brew install kubectl
brew install helm
brew install fluxcd/tap/flux
brew install gnupg sops

kind create cluster --image kindest/node:v1.16.15 --wait 5m

kubectl create namespace crossplane-system

helm repo add crossplane-stable https://charts.crossplane.io/stable
helm repo update

helm install crossplane --namespace crossplane-system crossplane-stable/crossplane

curl -sL https://raw.githubusercontent.com/crossplane/crossplane/master/install.sh | sh

kubectl crossplane install configuration registry.upbound.io/xp/getting-started-with-aws:v1.1.0

AWS_PROFILE=default && echo -e "[default]\naws_access_key_id = $(aws configure get aws_access_key_id --profile $AWS_PROFILE)\naws_secret_access_key = $(aws configure get aws_secret_access_key --profile $AWS_PROFILE)" > creds.conf

kubectl create secret generic aws-creds -n crossplane-system --from-file=creds=./creds.conf


flux install \
--namespace=flux-system \
--network-policy=false \
--components=source-controller,helm-controller,kustomize-controller


flux bootstrap github \
--owner=$GITHUB_USER \
--repository=GitOps \
--branch=main \
--path=./clusters/staging \
--personal
