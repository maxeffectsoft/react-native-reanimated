//
// Created by Szymon Kapala on 2020-02-11.
//

#ifndef REANIMATEDEXAMPLE_WORKLETREGISTRY_H
#define REANIMATEDEXAMPLE_WORKLETREGISTRY_H

#include <memory>
#include <unordered_map>
#include <jsi/jsi.h>
#include "Worklet.h"

using namespace facebook;

class WorkletRegistry {
  public:
    std::unordered_map<int, std::shared_ptr<Worklet>> workletMap;
    void registerWorklet(int id, std::shared_ptr<jsi::Function> ptr);
    void unregisterWorklet(int id);
    std::shared_ptr<Worklet> getWorklet(int id);
    void setWorkletListener(int workletId, std::shared_ptr<std::function<void()>> listener);
};

#endif //REANIMATEDEXAMPLE_WORKLETREGISTRY_H
