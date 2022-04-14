# WEIGHTING

# Weight changes are done using the weighting models. You aren't able to directly
# change the weight of a node.
# @app.route("/hierarchy/<hierarchy_id>/node/<node_id>", methods=['PATCH'])
# def change_weight(hierarchy_id, node_id):
#     pass


# TODO: Direct Assessment
# @app.route("/hierarchy/<hierarchy_id>/node/<parent_id>/weights/directAssessment", methods=['PATCH'])
# def direct_assessment(hierarchy_id, parent_id):
    # Get data (new weights)
    # [{"nodeId":1},"weight":.2},...]
    # Get nodes on the same level (children of parent)

    # If there aren't enough weights for each child
        # Return error

    # Check each weight
    # Rebalance??
    # pass

def balance_weights(weights):
    total = sum(weights)

    for i in range(len(weights)):
        weights[i] = weights[i] / total

    return weights


# TODO: Pair Wise
# @app.route("/hierarchy/<hierarchy_id>/node/<parent_id>/weights/pairWise", methods=['PATCH'])
# def pairwise(hierarchy_id, parent_id):
    # TODO: Ask Sharjeel if the matrix uses negative values?
    # Get data (new weight)
    # [
    #     {
    #         "nodeId":1,
    #         "pairComparison":{
    #                             nodeId:3,
    #                             nodeId:6, nodeId is the id of the node that 1 is being compared to.
    #                             nodeId:1,
    #                         }
    #     },
    #     ...
    # ]

    # Get the number of nodes
    # Get the children of parent
    # Compare, if they aren't equal, abort
    # Create node_number x node_number matrix
    # Populate the diagonal with 1
    # Populate the other cells with sent data and it's inverse
    # 0,0 = 1 0,1 = data 1,0 = 1/data

    pass


# TODO: Swing Weights
# @app.route("/hierarchy/<hierarchy_id>/node/<parent_id>/weights/directAssessment", methods=['PATCH'])
# def swing_weight(hierarchy_id, parent_id):
    # MVP: Direct Assessment using swing weight values
    # [{"nodeId":1},"swingWeight":.2},...]
    pass

if __name__ == "__main__":
    weights = [4, 4, 2]
    print(balance_weights(weights))

    float_weights = [4.4, 4.4, 2.2]
    print(balance_weights(float_weights))

    large_weights = [40, 40, 20]
    print(balance_weights(large_weights))

    mixed_weights = [.1, 10, 40.2]
    print(balance_weights(mixed_weights))